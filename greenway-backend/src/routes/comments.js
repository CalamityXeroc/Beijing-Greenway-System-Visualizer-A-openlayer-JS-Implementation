import { Router } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'greenway-secret-2025-change-me';
const DEFAULT_SENSITIVE_WORDS = ['傻逼', '妈的', '垃圾', '滚蛋'];
const RATE_LIMIT_PER_HOUR = 20;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SENSITIVE_WORDS_DIR = process.env.SENSITIVE_WORDS_DIR
  || path.resolve(__dirname, '../../../敏感词汇表');

const sensitiveWordsState = {
  words: [...DEFAULT_SENSITIVE_WORDS],
  regexList: [],
  loadedAt: null,
  source: 'default'
};

function parsePage(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWordRows(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('//'));
}

async function loadSensitiveWords() {
  const merged = new Set(DEFAULT_SENSITIVE_WORDS);

  const envWords = (process.env.SENSITIVE_WORDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const w of envWords) merged.add(w);

  try {
    const files = await fs.readdir(SENSITIVE_WORDS_DIR);
    const txtFiles = files.filter((name) => name.toLowerCase().endsWith('.txt'));
    for (const fileName of txtFiles) {
      const fullPath = path.join(SENSITIVE_WORDS_DIR, fileName);
      const content = await fs.readFile(fullPath, 'utf8');
      for (const word of normalizeWordRows(content)) {
        merged.add(word);
      }
    }

    sensitiveWordsState.source = `folder:${SENSITIVE_WORDS_DIR}`;
  } catch (err) {
    console.warn('[comments] 敏感词词库加载失败，回退默认词库:', err.message);
    sensitiveWordsState.source = 'default+env';
  }

  const words = Array.from(merged)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  sensitiveWordsState.words = words;
  sensitiveWordsState.regexList = words.map((word) => ({
    word,
    regex: new RegExp(escapeRegExp(word), 'iu')
  }));
  sensitiveWordsState.loadedAt = new Date().toISOString();

  console.log(`[comments] 敏感词词库已加载: ${words.length} 条, source=${sensitiveWordsState.source}`);
}

function findSensitiveWords(content) {
  if (!content) return [];
  const hits = [];
  for (const item of sensitiveWordsState.regexList) {
    if (item.regex.test(content)) {
      hits.push(item.word);
      if (hits.length >= 10) break;
    }
  }
  return hits;
}

void loadSensitiveWords();

async function handleList(req, res, greenwayIdInput) {
  const greenwayId = parseInt(greenwayIdInput, 10);
  const sort = req.query.sort === 'hot' ? 'hot' : 'newest';
  const page = Math.max(1, parsePage(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(1, parsePage(req.query.pageSize, 20)));
  const offset = (page - 1) * pageSize;

  if (!greenwayId) {
    return res.status(400).json({ code: 400, message: 'greenwayId 不能为空' });
  }

  const orderBy = sort === 'hot'
    ? 'c.like_count DESC, c.created_at DESC'
    : 'c.created_at DESC';

  try {
    const summaryResult = await req.pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating
       FROM greenway_comments
       WHERE greenway_id = $1 AND status = 'visible'`,
      [greenwayId]
    );

    const totalResult = await req.pool.query(
      `SELECT COUNT(*) AS count
       FROM greenway_comments
       WHERE greenway_id = $1 AND status = 'visible'`,
      [greenwayId]
    );

    const likedUserId = req.user?.id || null;
    const listResult = await req.pool.query(
      `SELECT c.id, c.greenway_id, c.user_id, c.parent_comment_id, c.content, c.rating, c.status, c.like_count, c.created_at,
              u.username, u.nickname,
              CASE WHEN cl.user_id IS NULL THEN false ELSE true END AS liked_by_me
       FROM greenway_comments c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN greenway_comment_likes cl ON cl.comment_id = c.id AND cl.user_id = $4
       WHERE c.greenway_id = $1 AND c.status = 'visible'
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [greenwayId, pageSize, offset, likedUserId]
    );

    return res.json({
      code: 200,
      data: {
        list: listResult.rows,
        total: parseInt(totalResult.rows[0].count, 10),
        page,
        pageSize,
        summary: {
          total: parseInt(summaryResult.rows[0].total, 10),
          avgRating: parseFloat(summaryResult.rows[0].avg_rating)
        }
      }
    });
  } catch (err) {
    console.error('[comments/list]', err);
    return res.status(500).json({ code: 500, message: '服务器错误' });
  }
}

router.get('/me', authMiddleware, async (req, res) => {
  const page = Math.max(1, parsePage(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(1, parsePage(req.query.pageSize, 10)));
  const offset = (page - 1) * pageSize;

  try {
    const totalResult = await req.pool.query(
      'SELECT COUNT(*) AS count FROM greenway_comments WHERE user_id = $1',
      [req.user.id]
    );

    const listResult = await req.pool.query(
      `SELECT c.id, c.greenway_id, c.content, c.rating, c.status, c.like_count, c.created_at, c.updated_at,
              g.name AS greenway_name
       FROM greenway_comments c
       LEFT JOIN greenways g ON g.id = c.greenway_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, pageSize, offset]
    );

    res.json({
      code: 200,
      data: {
        list: listResult.rows,
        total: parseInt(totalResult.rows[0].count, 10),
        page,
        pageSize
      }
    });
  } catch (err) {
    console.error('[comments/me]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  return handleList(req, res, req.query.greenwayId);
});

router.get('/trail/:trailId', optionalAuth, async (req, res) => {
  return handleList(req, res, req.params.trailId);
});

router.post('/', authMiddleware, async (req, res) => {
  const { greenwayId, content, rating, parentCommentId } = req.body;
  const safeContent = (content || '').trim();
  const hasParent = !(parentCommentId === undefined || parentCommentId === null || String(parentCommentId).trim() === '');
  const safeParentCommentId = hasParent ? parseInt(parentCommentId, 10) : null;
  const hasRating = !(rating === undefined || rating === null || String(rating).trim() === '');
  const safeRating = hasParent ? null : (hasRating ? parseInt(rating, 10) : null);

  if (!greenwayId) {
    return res.status(400).json({ code: 400, message: '未识别到当前绿道 ID，请刷新页面后重试' });
  }
  if (!safeContent) {
    return res.status(400).json({ code: 400, message: '评论内容不能为空' });
  }
  if (safeContent.length > 500) {
    return res.status(400).json({ code: 400, message: '评论最多 500 字' });
  }
  if (hasRating && (Number.isNaN(safeRating) || safeRating < 1 || safeRating > 5)) {
    return res.status(400).json({ code: 400, message: '评分必须在 1-5 之间' });
  }
  if (hasParent && (Number.isNaN(safeParentCommentId) || safeParentCommentId <= 0)) {
    return res.status(400).json({ code: 400, message: '回复目标无效' });
  }

  try {
    const greenwayResult = await req.pool.query('SELECT id FROM greenways WHERE id = $1', [greenwayId]);
    if (greenwayResult.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '绿道不存在' });
    }

    if (hasParent) {
      const parentResult = await req.pool.query(
        `SELECT id, greenway_id, status
         FROM greenway_comments
         WHERE id = $1`,
        [safeParentCommentId]
      );
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ code: 404, message: '被回复评论不存在' });
      }

      const parent = parentResult.rows[0];
      if (parseInt(parent.greenway_id, 10) !== parseInt(greenwayId, 10)) {
        return res.status(400).json({ code: 400, message: '回复目标与当前绿道不匹配' });
      }
      if (parent.status !== 'visible') {
        return res.status(400).json({ code: 400, message: '该评论当前不可回复' });
      }
    }

    const recentResult = await req.pool.query(
      `SELECT COUNT(*) AS count
       FROM greenway_comments
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '1 hour'`,
      [req.user.id]
    );
    if (parseInt(recentResult.rows[0].count, 10) >= RATE_LIMIT_PER_HOUR) {
      return res.status(429).json({ code: 429, message: '评论过于频繁，请稍后再试' });
    }

    const sensitiveHits = findSensitiveWords(safeContent);
    if (sensitiveHits.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '包含敏感词汇，禁止评论！'
      });
    }

    const insertResult = await req.pool.query(
      `INSERT INTO greenway_comments (greenway_id, user_id, parent_comment_id, content, rating, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, greenway_id, user_id, parent_comment_id, content, rating, status, like_count, created_at`,
      [greenwayId, req.user.id, safeParentCommentId, safeContent, safeRating, 'visible']
    );

    res.status(201).json({
      code: 200,
      message: hasParent ? '回复发布成功' : '评论发布成功',
      data: {
        ...insertResult.rows[0],
        autoReview: {
          passed: true,
          hitCount: 0,
          hits: []
        }
      }
    });
  } catch (err) {
    console.error('[comments/create]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.post('/:id/report', authMiddleware, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const reason = (req.body.reason || '其他').trim();
  const detail = (req.body.detail || '').trim();

  if (Number.isNaN(commentId)) {
    return res.status(400).json({ code: 400, message: '评论 ID 非法' });
  }

  try {
    const existsResult = await req.pool.query(
      'SELECT id FROM greenway_comments WHERE id = $1',
      [commentId]
    );
    if (existsResult.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    await req.pool.query(
      `INSERT INTO greenway_comment_reports (comment_id, reporter_user_id, reason, detail)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (comment_id, reporter_user_id) DO UPDATE SET
         reason = EXCLUDED.reason,
         detail = EXCLUDED.detail,
         created_at = CURRENT_TIMESTAMP`,
      [commentId, req.user.id, reason.slice(0, 100), detail.slice(0, 500)]
    );

    res.json({ code: 200, message: '举报已提交' });
  } catch (err) {
    console.error('[comments/report]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  if (Number.isNaN(commentId)) {
    return res.status(400).json({ code: 400, message: '评论 ID 非法' });
  }

  try {
    const findResult = await req.pool.query(
      'SELECT id, user_id FROM greenway_comments WHERE id = $1',
      [commentId]
    );

    if (findResult.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    const comment = findResult.rows[0];
    const isOwner = parseInt(comment.user_id, 10) === parseInt(req.user.id, 10);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ code: 403, message: '无权限删除该评论' });
    }

    await req.pool.query('DELETE FROM greenway_comments WHERE id = $1', [commentId]);

    res.json({ code: 200, message: '评论已删除' });
  } catch (err) {
    console.error('[comments/delete]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  if (Number.isNaN(commentId)) {
    return res.status(400).json({ code: 400, message: '评论 ID 非法' });
  }

  const client = await req.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO greenway_comment_likes (comment_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (comment_id, user_id) DO NOTHING`,
      [commentId, req.user.id]
    );

    await client.query(
      `UPDATE greenway_comments
       SET like_count = (
         SELECT COUNT(*)::integer
         FROM greenway_comment_likes
         WHERE comment_id = $1
       )
       WHERE id = $1`,
      [commentId]
    );

    const countResult = await client.query(
      'SELECT like_count FROM greenway_comments WHERE id = $1',
      [commentId]
    );

    await client.query('COMMIT');

    if (countResult.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    res.json({
      code: 200,
      message: '点赞成功',
      data: { likeCount: parseInt(countResult.rows[0].like_count, 10) }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[comments/like]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    client.release();
  }
});

router.delete('/:id/like', authMiddleware, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  if (Number.isNaN(commentId)) {
    return res.status(400).json({ code: 400, message: '评论 ID 非法' });
  }

  const client = await req.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM greenway_comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, req.user.id]
    );

    await client.query(
      `UPDATE greenway_comments
       SET like_count = (
         SELECT COUNT(*)::integer
         FROM greenway_comment_likes
         WHERE comment_id = $1
       )
       WHERE id = $1`,
      [commentId]
    );

    const countResult = await client.query(
      'SELECT like_count FROM greenway_comments WHERE id = $1',
      [commentId]
    );

    await client.query('COMMIT');

    if (countResult.rows.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    res.json({
      code: 200,
      message: '已取消点赞',
      data: { likeCount: parseInt(countResult.rows[0].like_count, 10) }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[comments/unlike]', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    client.release();
  }
});

export default router;
