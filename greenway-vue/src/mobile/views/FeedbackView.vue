<template>
  <div class="feedback-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>意见反馈</h1>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="form-card">
        <div class="field-group">
          <label class="field-label">反馈类型</label>
          <div class="type-selector">
            <button
              v-for="t in types"
              :key="t.value"
              class="type-chip"
              :class="{ active: feedbackType === t.value }"
              @click="feedbackType = t.value"
            >{{ t.label }}</button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">反馈内容</label>
          <textarea
            v-model="content"
            class="field-input textarea"
            placeholder="请详细描述您的建议或遇到的问题..."
            rows="5"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ content.length }}/500</div>
        </div>

        <div class="field-group" v-if="feedbackType === 'bug'">
          <label class="field-label">截图（可选）</label>
          <button class="screenshot-btn" @click="simulateScreenshot">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            添加截图
          </button>
          <span v-if="screenshotName" class="screenshot-name">{{ screenshotName }}</span>
        </div>

        <div class="field-group">
          <label class="field-label">联系方式（可选）</label>
          <input
            v-model="contact"
            class="field-input"
            placeholder="邮箱或手机号，方便我们回复您"
          />
        </div>
      </div>

      <div class="submit-area">
        <button
          class="submit-btn"
          :disabled="!content.trim()"
          @click="submitFeedback"
        >提交反馈</button>
      </div>

      <!-- 成功弹窗 -->
      <Teleport to="body">
        <div v-if="showSuccess" class="modal-overlay" @click="showSuccess = false">
          <div class="modal-card" @click.stop>
            <div class="success-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>感谢您的反馈！</h3>
            <p>我们会在 3 个工作日内回复您。</p>
            <button class="done-btn" @click="showSuccess = false">知道了</button>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

const types = [
  { label: '功能建议', value: 'suggestion' },
  { label: '问题反馈', value: 'bug' },
  { label: '内容纠错', value: 'content' },
  { label: '其他', value: 'other' }
]

const feedbackType = ref('suggestion')
const content = ref('')
const contact = ref('')
const screenshotName = ref('')
const showSuccess = ref(false)

function simulateScreenshot() {
  screenshotName.value = 'screenshot_' + Date.now().toString(36) + '.png'
}

function submitFeedback() {
  if (!content.value.trim()) return

  const feedback = {
    type: feedbackType.value,
    content: content.value.trim(),
    contact: contact.value.trim(),
    screenshot: screenshotName.value || null,
    time: new Date().toISOString()
  }

  // 存到 localStorage
  const existing = JSON.parse(localStorage.getItem('greenway_feedback') || '[]')
  existing.push(feedback)
  localStorage.setItem('greenway_feedback', JSON.stringify(existing))

  // 重置表单
  content.value = ''
  contact.value = ''
  screenshotName.value = ''
  feedbackType.value = 'suggestion'

  showSuccess.value = true
}
</script>

<style scoped>
.feedback-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 16px 14px;
}
.topbar h1 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-radius: 50%;
  cursor: pointer;
}
.placeholder { width: 36px; }

.content {
  padding: 16px;
}

.form-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  box-shadow: var(--shadow-sm);
}

.field-group {
  margin-bottom: 20px;
}
.field-group:last-child { margin-bottom: 0; }

.field-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.type-chip {
  padding: 8px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.type-chip.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.type-chip:active {
  transform: scale(0.96);
}

.field-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}
.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
}
.textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.screenshot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.screenshot-btn:active {
  background: var(--color-surface-2);
}
.screenshot-name {
  margin-left: 8px;
  font-size: var(--text-xs);
  color: var(--color-primary);
}

.submit-area {
  margin-top: 24px;
}
.submit-btn {
  width: 100%;
  padding: 16px;
  background: var(--gradient-brand);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.submit-btn:active:not(:disabled) {
  opacity: 0.8;
}

/* 成功弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } }

.modal-card {
  width: 100%;
  max-width: 300px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  text-align: center;
  animation: scaleIn 0.25s ease;
}
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } }

.success-icon { margin-bottom: 16px; }
.modal-card h3 {
  margin: 0 0 8px;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}
.modal-card p {
  margin: 0 0 20px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.done-btn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
}
</style>
