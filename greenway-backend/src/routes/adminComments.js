import { Router } from 'express';
import { authMiddleware, adminOnly } from '../auth.js';

const router = Router();

function parsePage(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  const page = Math.max(1, parsePage(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(1, parsePage(req.query.pageSize, 20)));
  const offset = (page - 1) * pageSize;
  const keyword = (req.query.keyword || '').trim();
  const userKeyword = (req.query.userKeyword || '').trim();
  const status = (req.query.status || '').trim();
  const greenwayId = parseInt(req.query.greenwayId, 10);

  const conditions = ['1=1'];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (!Number.isNaN(greenwayId) && greenwayId > 0) {
    params.push(greenwayId);
    conditions.push(`c.greenway_id = $${params.length}`);
  }
  if (keyword) {
    params.push(`%${keyword}%`);
    conditions.push(`c.content ILIKE $${params.length}`);
  }
  if (userKeyword) {
    params.push(`%${userKeyword}%`);
    conditions.push(`(u.username ILIKE $${params.length} OR u.nickname ILIKE $${params.length} OR CAST(u.id AS TEXT) ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');

  try {
    const countResult = await req.pool.query(
      `SELECT COUNT(*) AS count
       FROM greenway_comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE ${where}`,
      params
    );

    params.push(pageSize, offset);
    const listResult = await req.pool.query(
      `SELECT c.id, c.greenway_id, c.user_id, c.content, c.rating, c.status, c.like_count, c.created_at,
              u.username, u.nickname,
              g.name AS greenway_name
       FROM greenway_comments c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN greenways g ON g.id = c.greenway_id
       WHERE ${where}
       ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      code: 200,
      data: {
        list: listResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        pageSize
      }
    });
  } catch (err) {
    console.error('[admin/comments/list]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

async function updateCommentStatus(req, res) {
  const commentId = parseInt(req.params.id, 10);
  const status = req.body.status;
  if (Number.isNaN(commentId)) {
    return res.status(400).json({ code: 400, message: '评论 ID 非法' });
  }
  if (!['pending', 'visible', 'hidden'].includes(status)) {
    return res.status(400).json({ code: 400, message: 'status 仅支持 pending/visible/hidden' });
  }

  try {
    const result = await req.pool.query(
      `UPDATE greenway_comments
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, commentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    res.json({ code: 200, message: '评论状态更新成功', data: result.rows[0] });
  } catch (err) {
    console.error('[admin/comments/status]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
}

router.patch('/:id/status', authMiddleware, adminOnly, updateCommentStatus);
router.put('/:id/status', authMiddleware, adminOnly, updateCommentStatus);

router.patch('/batch/status', authMiddleware, adminOnly, async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n)) : [];
  const status = req.body.status;

  if (!ids.length) {
    return res.status(400).json({ code: 400, message: 'ids 不能为空' });
  }
  if (!['pending', 'visible', 'hidden'].includes(status)) {
    return res.status(400).json({ code: 400, message: 'status 仅支持 pending/visible/hidden' });
  }

  try {
    const result = await req.pool.query(
      `UPDATE greenway_comments
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2::int[])
       RETURNING id`,
      [status, ids]
    );

    res.json({
      code: 200,
      message: '批量更新成功',
      data: { updated: result.rows.length }
    });
  } catch (err) {
    console.error('[admin/comments/batch-status]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  const days = Math.min(90, Math.max(7, parsePage(req.query.days, 30)));

  try {
    const [trendResult, statusResult] = await Promise.all([
      req.pool.query(
        `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
         FROM greenway_comments
         WHERE created_at >= NOW() - ($1 || ' days')::interval
         GROUP BY DATE(created_at)
         ORDER BY day ASC`,
        [days]
      ),
      req.pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM greenway_comments
         GROUP BY status`
      )
    ]);

    const trendMap = new Map(trendResult.rows.map((r) => [r.day, r.count]));
    const trend = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      trend.push({ day: k, count: trendMap.get(k) || 0 });
    }

    const statusMap = { pending: 0, visible: 0, hidden: 0 };
    for (const row of statusResult.rows) {
      if (Object.prototype.hasOwnProperty.call(statusMap, row.status)) {
        statusMap[row.status] = Number(row.count || 0);
      }
    }

    res.json({
      code: 200,
      data: {
        trend,
        statusDistribution: statusMap
      }
    });
  } catch (err) {
    console.error('[admin/comments/stats]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
