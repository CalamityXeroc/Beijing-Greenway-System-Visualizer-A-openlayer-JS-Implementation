/**
 * 管理员 AI 对话分析 API
 * GET /api/admin/ai-stats?days=7   词云 + 趋势数据
 */

import express from 'express'
import { createRequire } from 'module'
import { authMiddleware, adminOnly } from '../auth.js'

const router = express.Router()

/* ──────────────────────────── 加载分词库（可选） ──────────────────────────── */
const require = createRequire(import.meta.url)
let segmentInstance = null
try {
  const Segment = require('segment')
  segmentInstance = new Segment()
  segmentInstance.useDefault()
  console.log('[分词] segment 加载成功')
} catch {
  console.warn('[分词] segment 未加载，使用内置基础分词器')
}

/* ──────────────────────────── 中文停用词表 ──────────────────────────── */
const STOPWORDS = new Set([
  // 语气助词
  '的', '了', '吗', '啊', '呢', '吧', '哦', '哈', '嗯', '哇', '哎', '诶',
  // 代词
  '我', '你', '他', '她', '它', '我们', '你们', '他们', '这', '那', '这个', '那个',
  '这里', '那里', '这些', '那些', '什么', '哪', '哪里', '哪个', '谁',
  // 动词（常见无意义词）
  '是', '有', '在', '到', '去', '来', '说', '做', '用', '看', '想', '知道',
  '可以', '能', '会', '要', '需要', '应该', '觉得', '感觉', '认为', '希望',
  '帮', '帮我', '帮助', '告诉', '介绍', '问', '问一下', '请问', '请',
  // 副词/连词
  '很', '非常', '比较', '最', '也', '都', '还', '又', '再', '只', '就', '才',
  '已经', '一直', '一下', '一起', '如果', '因为', '所以', '但是', '而且',
  '不', '没有', '没', '不是', '不会', '不能', '不要',
  // 量词/数词
  '一', '两', '个', '条', '段', '处', '公里', '米', '多少', '几',
  // 标点和其他
  '？', '！', '。', '，', '、', '：', '；',
])

/* ──────────────────────────── 分词函数 ──────────────────────────── */
/**
 * 将文本分词并过滤停用词，返回有效词语数组
 */
function tokenize(text) {
  let tokens = []

  if (segmentInstance) {
    // segment 精准分词，simple:true 直接返回词语字符串数组
    tokens = segmentInstance.doSegment(text, { simple: true })
  } else {
    // 内置基础分词器：提取连续中文，按2-4字切割
    const segments = text.match(/[\u4e00-\u9fa5]+/g) || []
    for (const seg of segments) {
      if (seg.length >= 2 && seg.length <= 10) {
        tokens.push(seg)
      }
      // 对于长段落，尝试2字和3字切分
      if (seg.length > 4) {
        for (let i = 0; i < seg.length - 1; i++) {
          tokens.push(seg.slice(i, i + 2))
          if (i < seg.length - 2) tokens.push(seg.slice(i, i + 3))
        }
      }
    }
  }

  return tokens.filter(t =>
    t &&
    t.length >= 2 &&            // 至少2个字
    !STOPWORDS.has(t) &&         // 不是停用词
    /[\u4e00-\u9fa5]/.test(t)   // 包含中文
  )
}

/* ──────────────────────────── 工具：补全日期序列 ──────────────────────────── */
function fillDateSeries(rows, days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const found = rows.find(r => {
      const rowDay = r.day instanceof Date
        ? r.day.toISOString().slice(0, 10)
        : String(r.day).slice(0, 10)
      return rowDay === key
    })
    result.push({ day: key, count: found ? parseInt(found.count) : 0 })
  }
  return result
}

/* ──────────────────────────── GET /api/admin/ai-stats ──────────────────────────── */
router.get('/ai-stats', authMiddleware, adminOnly, async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 7))

  try {
    // 1. 查询指定天数内的所有消息
    const { rows: msgRows } = await req.pool.query(
      `SELECT message, created_at
       FROM chat_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       ORDER BY created_at DESC
       LIMIT 5000`,
    )

    // 2. 分词 + 词频统计
    const freqMap = new Map()
    for (const { message } of msgRows) {
      const tokens = tokenize(message)
      for (const t of tokens) {
        freqMap.set(t, (freqMap.get(t) || 0) + 1)
      }
    }

    // 过滤低频词（至少出现2次），排序取 Top 80
    const wordFrequency = Array.from(freqMap.entries())
      .filter(([, v]) => v >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 80)
      .map(([word, count]) => ({ word, count }))

    // 3. 查询每日消息量趋势
    const { rows: trendRows } = await req.pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM chat_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    )

    const dailyTrend = fillDateSeries(trendRows, days).map(r => ({ date: r.day, count: r.count }))

    // 4. 基础统计
    const { rows: sessionRows } = await req.pool.query(
      `SELECT COUNT(DISTINCT conversation_id) AS sessions
       FROM chat_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'`
    )

    res.json({
      summary: {
        total_messages: msgRows.length,
        unique_sessions: parseInt(sessionRows[0]?.sessions || 0),
        unique_words: wordFrequency.length,
        days,
        tokenizer: segmentInstance ? 'segment' : 'builtin'
      },
      wordFrequency,
      dailyTrend
    })
  } catch (err) {
    console.error('[admin/ai-stats]', err)
    res.status(500).json({ code: 500, message: '服务器错误: ' + err.message })
  }
})

/* ──────────────────────────── GET /api/admin/ai-stats/recent ──────────────────────────── */
// 最近 N 条原始消息，用于日志查看
router.get('/ai-stats/recent', authMiddleware, adminOnly, async (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit) || 50)
  try {
    const { rows } = await req.pool.query(
      `SELECT id, conversation_id, message, created_at
       FROM chat_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    )
    res.json({ messages: rows })
  } catch (err) {
    console.error('[admin/ai-stats/recent]', err)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
