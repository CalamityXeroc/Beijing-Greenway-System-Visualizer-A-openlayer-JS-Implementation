/**
 * 绿道AI助手 - 后端路由
 * POST /api/ai/chat          发送消息，获取 AI 回复
 * GET  /api/ai/context/:id   获取对话历史（调试用）
 * DELETE /api/ai/context/:id 清除对话历史
 */

import express from 'express'
import { selectPrompt } from '../prompts/system-prompt.js'

const router = express.Router()

/* ──────────────────────────── 对话历史存储 ──────────────────────────── */
// Map<conversationId, Message[]>
// 每个 Message: { role: 'user'|'assistant', content: string }
const conversationStore = new Map()

// 每个会话最多保留的消息条数（单边，共 2x 轮数）
const MAX_HISTORY_MESSAGES = 20

/**
 * 获取或初始化对话历史
 */
const getHistory = (conversationId) => {
  if (!conversationStore.has(conversationId)) {
    conversationStore.set(conversationId, [])
  }
  return conversationStore.get(conversationId)
}

/* ──────────────────────────── 调用 SiliconFlow API ──────────────────────────── */
/**
 * @param {Object[]} messages - [{role, content}, ...]
 * @returns {Promise<string>} AI 回复文本
 */
const callSiliconFlow = async (messages) => {
  const apiUrl   = process.env.SILICONFLOW_API_URL   || 'https://api.siliconflow.cn/v1/chat/completions'
  const apiKey   = process.env.SILICONFLOW_API_KEY
  const model    = process.env.AI_MODEL              || 'deepseek-ai/DeepSeek-V3'
  const maxTokens   = parseInt(process.env.AI_MAX_TOKENS)   || 1024
  const temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7
  const timeout     = parseInt(process.env.AI_REQUEST_TIMEOUT) || 30000

  if (!apiKey) {
    throw new Error('SILICONFLOW_API_KEY 未配置，请检查 .env 文件')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`SiliconFlow API 返回 ${response.status}: ${errText.slice(0, 200)}`)
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content

    if (!reply) {
      throw new Error('SiliconFlow API 返回了空回复')
    }

    return reply.trim()
  } finally {
    clearTimeout(timer)
  }
}

/* ──────────────────────────── 路由：发送消息 ──────────────────────────── */
router.post('/chat', async (req, res) => {
  const { message, conversationId } = req.body

  // 参数校验
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: '消息内容不能为空' })
  }

  const msgText = message.trim().slice(0, 2000)  // 限制单条消息长度
  const cid = (conversationId && typeof conversationId === 'string')
    ? conversationId.slice(0, 64)
    : 'default'

  // 根据本条消息内容选择 System Prompt
  const systemPrompt = selectPrompt(msgText)

  // 获取历史
  const history = getHistory(cid)

  // 裁剪历史，防止超出 token 限制
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES)

  // 构建发给 LLM 的消息列表
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: msgText }
  ]

  try {
    const reply = await callSiliconFlow(apiMessages)

    // 保存本轮对话到历史
    history.push({ role: 'user', content: msgText })
    history.push({ role: 'assistant', content: reply })

    // 防止历史无限增长
    if (history.length > MAX_HISTORY_MESSAGES * 2) {
      history.splice(0, 2)
    }

    return res.json({
      reply,
      conversationId: cid
    })
  } catch (err) {
    console.error('[AI /chat 错误]', err.message)

    // 区分超时和其他错误，给前端友好提示
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI 响应超时，请稍后重试' })
    }

    if (err.message.includes('API_KEY')) {
      return res.status(503).json({ error: 'AI 服务未配置，请联系管理员' })
    }

    return res.status(502).json({ error: 'AI 服务暂时不可用，请稍后重试' })
  }
})

/* ──────────────────────────── 路由：获取历史（调试） ──────────────────────────── */
router.get('/context/:conversationId', (req, res) => {
  const { conversationId } = req.params
  const history = conversationStore.get(conversationId) || []
  res.json({ conversationId, messageCount: history.length, history })
})

/* ──────────────────────────── 路由：清除历史 ──────────────────────────── */
router.delete('/context/:conversationId', (req, res) => {
  const { conversationId } = req.params
  conversationStore.delete(conversationId)
  res.json({ success: true, message: '对话历史已清除' })
})

export default router
