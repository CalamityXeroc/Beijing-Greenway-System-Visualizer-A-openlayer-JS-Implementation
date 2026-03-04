<template>
  <div class="ai-chatbot-root">
    <!-- 浮动按钮（收起时） -->
    <Transition name="fab">
      <button
        v-if="!isOpen"
        class="chatbot-fab"
        @click="openChat"
        aria-label="打开绿道AI助手"
      >
        <span class="fab-icon">🌿</span>
        <span class="fab-pulse" />
      </button>
    </Transition>

    <!-- 聊天面板 -->
    <Transition name="panel">
      <div v-if="isOpen" class="chatbot-panel" role="dialog" aria-label="绿道小助手">

        <!-- ===== 头部 ===== -->
        <div class="chatbot-header">
          <div class="header-info">
            <div class="header-avatar">🌿</div>
            <div class="header-text">
              <span class="header-name">绿道小助手</span>
              <span class="header-status">
                <span class="status-dot" />
                在线服务中
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" @click="clearChat" title="清空对话">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.22"/>
              </svg>
            </button>
            <button class="icon-btn" @click="closeChat" title="关闭">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ===== 快捷建议（仅首次展示） ===== -->
        <Transition name="fade-down">
          <div v-if="showSuggestions" class="suggestions-bar">
            <span class="suggestions-label">💡 快速提问</span>
            <div class="suggestions-chips">
              <button
                v-for="s in suggestions"
                :key="s"
                class="chip"
                @click="selectSuggestion(s)"
              >{{ s }}</button>
            </div>
          </div>
        </Transition>

        <!-- ===== 消息列表 ===== -->
        <div class="chatbot-messages" ref="messagesEl">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['msg-row', msg.role]"
          >
            <!-- 助手头像 -->
            <div v-if="msg.role === 'assistant'" class="msg-avatar">🌿</div>

            <div class="msg-bubble-wrap">
              <!-- 气泡 -->
              <div :class="['msg-bubble', msg.role]">
                <!-- 渲染 AI 回复：支持换行和**加粗** -->
                <template v-if="msg.role === 'assistant'">
                  <span
                    v-for="(part, i) in parseMsgContent(msg.content)"
                    :key="i"
                    :class="{ bold: part.bold }"
                    v-html="part.text"
                  />
                </template>
                <template v-else>{{ msg.content }}</template>
              </div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>

            <!-- 用户头像 -->
            <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">👤</div>
          </div>

          <!-- 打字动画 -->
          <div v-if="isLoading" class="msg-row assistant">
            <div class="msg-avatar">🌿</div>
            <div class="msg-bubble assistant typing-bubble">
              <span class="dot" /><span class="dot" /><span class="dot" />
            </div>
          </div>
        </div>

        <!-- ===== 输入区 ===== -->
        <div class="chatbot-input-area">
          <div :class="['input-wrap', { focused: inputFocused }]">
            <textarea
              ref="inputEl"
              v-model="userInput"
              :disabled="isLoading"
              placeholder="输入问题，例如：推荐一条适合骑行的绿道…"
              rows="1"
              @keydown.enter.prevent="handleEnter"
              @focus="inputFocused = true"
              @blur="inputFocused = false"
              @input="autoResize"
            />
            <button
              class="send-btn"
              :disabled="!userInput.trim() || isLoading"
              @click="sendMessage"
              aria-label="发送"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21L23 12 2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
          <p class="input-hint">Enter 发送 &nbsp;·&nbsp; Shift+Enter 换行</p>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed } from 'vue'

/* ─────────────────────────── 状态 ─────────────────────────── */
const isOpen       = ref(false)
const isLoading    = ref(false)
const inputFocused = ref(false)
const userInput    = ref('')
const messagesEl   = ref(null)
const inputEl      = ref(null)
const showSuggestions = ref(true)

// 生成唯一会话ID（刷新页面重置）
const conversationId = crypto.randomUUID()

/* ─────────────────────────── 消息 ─────────────────────────── */
let _mid = 1
const makeId = () => _mid++
const timeNow = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const messages = reactive([
  {
    id: makeId(),
    role: 'assistant',
    content: '你好！👋 我是**绿道小助手**，可以帮你：\n\n🗺️ **推荐绿道** — 根据你的需求选路线\n🛠️ **操作指引** — 告诉你如何使用平台功能\n🌿 **绿道知识** — 解答关于北京绿道的问题\n\n有什么我可以帮你的吗？',
    time: timeNow()
  }
])

/* ─────────────────────────── 快捷建议 ─────────────────────────── */
const suggestions = [
  '推荐适合家庭出行的绿道',
  '最适合骑行的绿道是哪条？',
  '怎么使用测量工具？',
  '温榆河绿道有多长？'
]

const selectSuggestion = (text) => {
  showSuggestions.value = false
  userInput.value = text
  sendMessage()
}

/* ─────────────────────────── 消息内容解析 ─────────────────────────── */
// 把 **粗体** 和 \n 换行渲染成 HTML span
const parseMsgContent = (text) => {
  if (!text) return []
  // 将 \n 替换为 <br> 再拆分粗体
  const lines = text.replace(/\n/g, '<br>')
  const parts = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(lines)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: lines.slice(lastIndex, match.index), bold: false })
    }
    parts.push({ text: match[1], bold: true })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < lines.length) {
    parts.push({ text: lines.slice(lastIndex), bold: false })
  }
  return parts.length ? parts : [{ text: lines, bold: false }]
}

/* ─────────────────────────── 面板操作 ─────────────────────────── */
const openChat = () => {
  isOpen.value = true
  nextTick(() => {
    scrollBottom()
    inputEl.value?.focus()
  })
}

const closeChat = () => {
  isOpen.value = false
}

const clearChat = () => {
  messages.splice(1) // 保留欢迎消息
  showSuggestions.value = true
  // 清除服务端历史
  fetch(`/api/ai/context/${conversationId}`, { method: 'DELETE' }).catch(() => {})
}

/* ─────────────────────────── 发消息 ─────────────────────────── */
const handleEnter = (e) => {
  if (e.shiftKey) return  // Shift+Enter 换行
  sendMessage()
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  showSuggestions.value = false

  // 添加用户消息
  messages.push({ id: makeId(), role: 'user', content: text, time: timeNow() })
  userInput.value = ''
  isLoading.value = true

  // 重置 textarea 高度
  await nextTick()
  if (inputEl.value) inputEl.value.style.height = 'auto'
  scrollBottom()

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        conversationId
      })
    })
    const data = await res.json()

    messages.push({
      id: makeId(),
      role: 'assistant',
      content: res.ok ? data.reply : `⚠️ ${data.error || '服务暂时不可用，请稍后重试'}`,
      time: timeNow()
    })
  } catch {
    messages.push({
      id: makeId(),
      role: 'assistant',
      content: '⚠️ 网络连接失败，请检查网络后重试',
      time: timeNow()
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollBottom()
  }
}

/* ─────────────────────────── 工具函数 ─────────────────────────── */
const scrollBottom = () => {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

const autoResize = () => {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}
</script>

<style scoped>
/* ======================== 容器 ======================== */
.ai-chatbot-root {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9000;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
  font-size: 14px;
}

/* ======================== 浮动按钮 ======================== */
.chatbot-fab {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(22, 163, 74, 0.45);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.chatbot-fab:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 28px rgba(22, 163, 74, 0.55);
}

.fab-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.4);
  animation: pulse 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ======================== 面板容器 ======================== */
.chatbot-panel {
  width: 390px;
  max-height: 640px;
  min-height: 480px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ======================== 头部 ======================== */
.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: #fff;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.header-status {
  font-size: 11px;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #86efac;
  box-shadow: 0 0 6px #86efac;
  animation: blink 2s ease infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ======================== 快捷建议 ======================== */
.suggestions-bar {
  padding: 10px 14px;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;
  flex-shrink: 0;
}

.suggestions-label {
  font-size: 11px;
  color: #16a34a;
  font-weight: 600;
  display: block;
  margin-bottom: 7px;
  letter-spacing: 0.3px;
}

.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid #bbf7d0;
  background: #fff;
  color: #15803d;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.chip:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

/* ======================== 消息列表 ======================== */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
}

.chatbot-messages::-webkit-scrollbar {
  width: 4px;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: msgIn 0.22s ease-out both;
}

.msg-row.user {
  justify-content: flex-end;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.user-avatar {
  background: #e0e7ff;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
  max-width: 72%;
}

.msg-row.user .msg-bubble-wrap {
  align-items: flex-end;
}

.msg-bubble {
  padding: 10px 13px;
  border-radius: 12px;
  line-height: 1.55;
  word-break: break-word;
  font-size: 13.5px;
}

.msg-bubble.assistant {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.msg-bubble.user {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-bubble :deep(.bold) {
  font-weight: 700;
}

.msg-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 3px;
  padding: 0 4px;
}

/* 打字动画气泡 */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  min-width: 56px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: dotBounce 1.4s ease infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 60%, 100% { transform: translateY(0);  opacity: 0.4; }
  30%            { transform: translateY(-6px); opacity: 1; }
}

/* ======================== 输入区 ======================== */
.chatbot-input-area {
  padding: 10px 12px 8px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 6px 8px 6px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap.focused {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
  background: #fff;
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 13.5px;
  font-family: inherit;
  line-height: 1.5;
  color: #1f2937;
  outline: none;
  max-height: 120px;
  overflow-y: auto;
}

textarea::placeholder {
  color: #9ca3af;
}

.send-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: none;
  background: #16a34a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #15803d;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.input-hint {
  font-size: 10.5px;
  color: #9ca3af;
  margin: 5px 0 0 4px;
}

/* ======================== 过渡动画 ======================== */
.fab-enter-active,
.fab-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

.panel-enter-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}

.fade-down-enter-active { transition: opacity 0.3s, transform 0.3s; }
.fade-down-enter-from   { opacity: 0; transform: translateY(-8px); }

/* ======================== 深色模式 ======================== */
:global([data-theme="night"]) .chatbot-panel {
  background: #111827;
}

:global([data-theme="night"]) .chatbot-messages {
  color: #f3f4f6;
}

:global([data-theme="night"]) .msg-bubble.assistant {
  background: #1f2937;
  color: #f3f4f6;
}

:global([data-theme="night"]) .suggestions-bar {
  background: #1a2e1f;
  border-bottom-color: #166534;
}

:global([data-theme="night"]) .chip {
  background: #1f2937;
  color: #4ade80;
  border-color: #166534;
}

:global([data-theme="night"]) .chip:hover {
  background: #16a34a;
  color: #fff;
}

:global([data-theme="night"]) .input-wrap {
  background: #1f2937;
  border-color: #374151;
}

:global([data-theme="night"]) .input-wrap.focused {
  border-color: #22c55e;
  background: #1f2937;
}

:global([data-theme="night"]) textarea {
  color: #f3f4f6;
}

:global([data-theme="night"]) .chatbot-input-area {
  border-top-color: #1f2937;
}

:global([data-theme="night"]) .msg-avatar {
  background: #1a2e1f;
}

:global([data-theme="night"]) .user-avatar {
  background: #1e1b4b;
}

/* ======================== 移动端响应式 ======================== */
@media (max-width: 480px) {
  .ai-chatbot-root {
    bottom: 16px;
    right: 16px;
  }

  .chatbot-panel {
    width: calc(100vw - 32px);
    max-height: 75vh;
    border-radius: 16px;
  }
}
</style>
