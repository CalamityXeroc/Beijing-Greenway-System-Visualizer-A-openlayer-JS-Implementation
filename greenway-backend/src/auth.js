/**
 * 北京绿道平台 - 认证与用户管理 API
 * 路由：
 *   POST /api/auth/register          用户注册
 *   POST /api/auth/login             用户登录
 *   POST /api/auth/admin/login       管理员登录
 *   GET  /api/admin/users            取用户列表（管理员）
 *   GET  /api/admin/users/:id        取单个用户（管理员）
 *   PUT  /api/admin/users/:id        编辑用户（管理员）
 *   PATCH /api/admin/users/:id/status 启禁用用户（管理员）
 *   DELETE /api/admin/users/:id      删除用户（管理员）
 *   GET  /api/admin/stats            平台统计（管理员）
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'greenway-secret-2025-change-me';
const JWT_EXPIRES  = '24h';
const SALT_ROUNDS  = 10;

// ─── 工具 ──────────────────────────────────────────

/** 生成 token */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/** JWT 中间件 */
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或 Token 已过期' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ code: 401, message: 'Token 无效' });
  }
}

/** 管理员权限校验 */
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限，仅管理员可操作' });
  }
  next();
}

/** 写入系统日志（静默失败，不影响主流程） */
async function writeLog(pool, { userId, username, action, target, ip, userAgent, detail }) {
  try {
    await pool.query(
      `INSERT INTO system_logs (user_id, username, action, target, ip, user_agent, detail)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, username || null, action, target || null,
       ip || null, userAgent || null, detail || null]
    );
  } catch (e) {
    // 日志表可能未初始化，静默忽略
  }
}

// ─── 公开接口 ───────────────────────────────────────

/**
 * POST /api/auth/register
 * body: { username, email, password, nickname? }
 */
router.post('/auth/register', async (req, res) => {
  const { username, email, password, nickname } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ code: 400, message: '用户名、邮箱、密码不能为空' });
  }
  if (password.length < 6) {
    return res.status(400).json({ code: 400, message: '密码至少 6 位' });
  }

  try {
    // 检查重复
    const { rows: exist } = await req.pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (exist.length > 0) {
      return res.status(409).json({ code: 409, message: '用户名或邮箱已被注册' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await req.pool.query(
      `INSERT INTO users (username, email, password, nickname)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, nickname, role, status, created_at`,
      [username, email, hash, nickname || username]
    );

    const user = rows[0];
    const token = signToken({ id: user.id, username: user.username, role: user.role });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    writeLog(req.pool, { userId: user.id, username: user.username, action: 'register',
      target: user.email, ip, userAgent: req.headers['user-agent'], detail: '新用户注册' });

    res.status(201).json({ code: 200, message: '注册成功', data: { token, user } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/auth/login
 * body: { username | email, password }
 */
router.post('/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ code: 400, message: '账号和密码不能为空' });
  }

  try {
    const { rows } = await req.pool.query(
      `SELECT * FROM users WHERE (username=$1 OR email=$1)`,
      [identifier]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '账号已被禁用，请联系管理员' });
    }

    // 更新最后登录时间
    await req.pool.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]);

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    writeLog(req.pool, { userId: user.id, username: user.username, action: 'login',
      ip, userAgent: req.headers['user-agent'], detail: '用户登录成功' });

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    const { password: _, ...safeUser } = user;

    res.json({ code: 200, message: '登录成功', data: { token, user: safeUser } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/auth/admin/login
 * 管理员专用登录入口，成功后校验 role=admin
 */
router.post('/auth/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '账号和密码不能为空' });
  }

  try {
    const { rows } = await req.pool.query(
      `SELECT * FROM users WHERE username=$1 OR email=$1`,
      [username]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '您没有管理员权限' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }

    await req.pool.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]);

    const ip2 = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    writeLog(req.pool, { userId: user.id, username: user.username, action: 'admin_login',
      ip: ip2, userAgent: req.headers['user-agent'], detail: '管理员登录成功' });

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    const { password: _, ...safeUser } = user;

    res.json({ code: 200, message: '管理员登录成功', data: { token, user: safeUser } });
  } catch (err) {
    console.error('[admin/login]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// ─── 管理员接口（需 JWT + role=admin） ──────────────

/**
 * GET /api/admin/users?page=1&pageSize=20&keyword=&role=&status=
 */
router.get('/admin/users', authMiddleware, adminOnly, async (req, res) => {
  const { page = 1, pageSize = 20, keyword = '', role = '', status = '' } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const conditions = ['1=1'];
  const params = [];

  if (keyword) {
    params.push(`%${keyword}%`);
    conditions.push(`(username ILIKE $${params.length} OR email ILIKE $${params.length} OR nickname ILIKE $${params.length})`);
  }
  if (role) { params.push(role); conditions.push(`role=$${params.length}`); }
  if (status) { params.push(status); conditions.push(`status=$${params.length}`); }

  const where = conditions.join(' AND ');

  try {
    const countResult = await req.pool.query(
      `SELECT COUNT(*) FROM users WHERE ${where}`, params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(Number(pageSize), offset);
    const { rows } = await req.pool.query(
      `SELECT id, username, email, nickname, role, status, created_at, last_login
       FROM users WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ code: 200, data: { list: rows, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    console.error('[admin/users]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/admin/users/:id
 */
router.get('/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { rows } = await req.pool.query(
      `SELECT id, username, email, nickname, role, status, created_at, last_login
       FROM users WHERE id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 200, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * PUT /api/admin/users/:id
 * body: { nickname?, email?, role?, status? }
 */
router.put('/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { nickname, email, role, status } = req.body;
  const allowed = ['user', 'admin'];
  const allowedStatus = ['active', 'disabled'];

  if (role && !allowed.includes(role))
    return res.status(400).json({ code: 400, message: 'role 值非法' });
  if (status && !allowedStatus.includes(status))
    return res.status(400).json({ code: 400, message: 'status 值非法' });

  // 不允许管理员禁用自己
  if (String(req.user.id) === String(req.params.id) && status === 'disabled')
    return res.status(400).json({ code: 400, message: '不能禁用自己的账号' });

  try {
    const sets = [], params = [];
    if (nickname !== undefined) { params.push(nickname); sets.push(`nickname=$${params.length}`); }
    if (email    !== undefined) { params.push(email);    sets.push(`email=$${params.length}`); }
    if (role     !== undefined) { params.push(role);     sets.push(`role=$${params.length}`); }
    if (status   !== undefined) { params.push(status);   sets.push(`status=$${params.length}`); }

    if (!sets.length) return res.status(400).json({ code: 400, message: '无修改字段' });

    params.push(req.params.id);
    const { rows } = await req.pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id=$${params.length}
       RETURNING id, username, email, nickname, role, status, created_at, last_login`,
      params
    );
    if (!rows[0]) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 200, message: '更新成功', data: rows[0] });
  } catch (err) {
    console.error('[admin/users PUT]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * body: { status: 'active' | 'disabled' }
 */
router.patch('/admin/users/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status))
    return res.status(400).json({ code: 400, message: 'status 值非法' });
  if (String(req.user.id) === String(req.params.id))
    return res.status(400).json({ code: 400, message: '不能修改自己的状态' });

  try {
    const { rows } = await req.pool.query(
      `UPDATE users SET status=$1 WHERE id=$2
       RETURNING id, username, status`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 200, message: status === 'disabled' ? '已禁用' : '已启用', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * DELETE /api/admin/users/:id
 */
router.delete('/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  if (String(req.user.id) === String(req.params.id))
    return res.status(400).json({ code: 400, message: '不能删除自己的账号' });

  try {
    const { rowCount } = await req.pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/admin/stats
 * 返回平台基本统计数字
 */
router.get('/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users, greenways, active] = await Promise.all([
      req.pool.query('SELECT COUNT(*) FROM users'),
      req.pool.query('SELECT COUNT(*) FROM greenways'),
      req.pool.query("SELECT COUNT(*) FROM users WHERE status='active'"),
    ]);
    res.json({
      code: 200,
      data: {
        totalUsers:    parseInt(users.rows[0].count),
        totalGreenways: parseInt(greenways.rows[0].count),
        activeUsers:   parseInt(active.rows[0].count),
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/admin/logs?page=1&pageSize=20&action=&keyword=
 * 系统操作日志列表（管理员）
 */
router.get('/admin/logs', authMiddleware, adminOnly, async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
  const action   = req.query.action   || '';
  const keyword  = req.query.keyword  || '';
  const offset   = (page - 1) * pageSize;

  const conditions = [];
  const params = [];
  if (action)  { params.push(action);          conditions.push(`l.action = $${params.length}`); }
  if (keyword) { params.push(`%${keyword}%`);  conditions.push(`(l.username ILIKE $${params.length} OR l.detail ILIKE $${params.length} OR l.ip ILIKE $${params.length})`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const countRes = await req.pool.query(
      `SELECT COUNT(*) FROM system_logs l ${where}`, params
    );
    const total = parseInt(countRes.rows[0].count);

    params.push(pageSize, offset);
    const { rows } = await req.pool.query(
      `SELECT l.id, l.user_id, l.username, l.action, l.target,
              l.ip, l.detail, l.created_at
       FROM system_logs l
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ code: 200, data: { logs: rows, total, page, pageSize } });
  } catch (err) {
    console.error('[logs]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/admin/stats/trend?days=14
 * 最近N天每日登录次数趋势
 */
router.get('/admin/stats/trend', authMiddleware, adminOnly, async (req, res) => {
  const days = Math.min(30, Math.max(7, parseInt(req.query.days) || 14));
  try {
    const { rows } = await req.pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM system_logs
       WHERE action IN ('login','admin_login')
         AND created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    // 补全缺失日期（无数据的日期填0）
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = rows.find(r => r.day.toISOString().slice(0, 10) === key);
      result.push({ day: key, count: found ? parseInt(found.count) : 0 });
    }

    res.json({ code: 200, data: result });
  } catch (err) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export { authMiddleware, adminOnly };
export default router;

