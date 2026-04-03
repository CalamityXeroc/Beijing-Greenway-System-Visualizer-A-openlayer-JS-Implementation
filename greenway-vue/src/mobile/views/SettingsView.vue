<template>
  <div class="settings-page">
    <!-- 顶部导航 -->
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>设置</h1>
      <div class="placeholder"></div>
    </div>

    <div class="settings-content">
      <!-- 账号安全 -->
      <section class="setting-section">
        <h2 class="section-title">
          <span class="icon-box account">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          账号安全
        </h2>
        <div class="setting-group">
          <div class="setting-item" @click="editProfile">
            <span class="item-label">个人资料</span>
            <div class="item-right">
              <span class="item-hint">修改头像、昵称</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="changePassword">
            <span class="item-label">修改密码</span>
            <div class="item-right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="bindPhone">
            <span class="item-label">手机绑定</span>
            <div class="item-right">
              <span class="item-hint">{{ maskedPhone || '未绑定' }}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- 通用设置 -->
      <section class="setting-section">
        <h2 class="section-title">
          <span class="icon-box general">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          通用设置
        </h2>
        <div class="setting-group">
          <div class="setting-item">
            <span class="item-label">深色模式</span>
            <div class="item-right">
              <label class="switch">
                <input type="checkbox" v-model="darkMode" @change="toggleDarkMode">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <span class="item-label">字体大小</span>
            <div class="item-right">
              <div class="font-size-control">
                <button @click="decreaseFontSize" :disabled="fontSizeLevel <= 0">A-</button>
                <span class="font-level">{{ fontSizeLabels[fontSizeLevel] }}</span>
                <button @click="increaseFontSize" :disabled="fontSizeLevel >= 2">A+</button>
              </div>
            </div>
          </div>
          <div class="setting-item" @click="showLanguageSheet">
            <span class="item-label">语言</span>
            <div class="item-right">
              <span class="item-hint">简体中文</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- 消息通知 -->
      <section class="setting-section">
        <h2 class="section-title">
          <span class="icon-box notify">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </span>
          消息通知
        </h2>
        <div class="setting-group">
          <div class="setting-item">
            <span class="item-label">评论通知</span>
            <div class="item-right">
              <label class="switch">
                <input type="checkbox" v-model="notifyComments">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <span class="item-label">系统通知</span>
            <div class="item-right">
              <label class="switch">
                <input type="checkbox" v-model="notifySystem">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <span class="item-label">活动推送</span>
            <div class="item-right">
              <label class="switch">
                <input type="checkbox" v-model="notifyActivity">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- 隐私与数据 -->
      <section class="setting-section">
        <h2 class="section-title">
          <span class="icon-box privacy">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          隐私与数据
        </h2>
        <div class="setting-group">
          <div class="setting-item" @click="goDiagnostic">
            <span class="item-label">网络诊断</span>
            <div class="item-right">
              <span class="item-hint">检查后端连接</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="clearCache">
            <span class="item-label">清除缓存</span>
            <div class="item-right">
              <span class="item-hint">{{ cacheSize }}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="showPrivacyPolicy">
            <span class="item-label">隐私政策</span>
            <div class="item-right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="showUserAgreement">
            <span class="item-label">用户协议</span>
            <div class="item-right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- 关于 -->
      <section class="setting-section">
        <h2 class="section-title">
          <span class="icon-box about">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          关于
        </h2>
        <div class="setting-group">
          <div class="setting-item" @click="checkUpdate">
            <span class="item-label">检查更新</span>
            <div class="item-right">
              <span class="item-hint">{{ appVersion }}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="showFeedback">
            <span class="item-label">意见反馈</span>
            <div class="item-right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="setting-item" @click="showAbout">
            <span class="item-label">关于北京绿道</span>
            <div class="item-right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- 退出登录 -->
      <div class="logout-wrapper" v-if="isLoggedIn">
        <button class="logout-btn" @click="confirmLogout">退出登录</button>
      </div>
    </div>

    <div class="bottom-safe"></div>

    <!-- 语言选择面板 -->
    <Teleport to="body">
      <div class="action-sheet-overlay" v-if="showLanguage" @click="showLanguage = false">
        <div class="action-sheet" @click.stop>
          <div class="sheet-header">
            <h3>选择语言</h3>
          </div>
          <div class="sheet-options">
            <button class="sheet-option active">
              <span>简体中文</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <button class="sheet-option" disabled>
              <span>繁體中文</span>
              <span class="coming">即将支持</span>
            </button>
            <button class="sheet-option" disabled>
              <span>English</span>
              <span class="coming">即将支持</span>
            </button>
          </div>
          <button class="sheet-cancel" @click="showLanguage = false">取消</button>
        </div>
      </div>
    </Teleport>

    <!-- 关于页面 -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="showAboutModal" @click="showAboutModal = false">
        <div class="modal-content about-modal" @click.stop>
          <div class="about-header">
            <div class="app-icon">
              <svg viewBox="0 0 100 100" width="72" height="72">
                <defs>
                  <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#34d399"/>
                    <stop offset="100%" style="stop-color:#059669"/>
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="22" fill="url(#greenGrad)"/>
                <path d="M50 20 C30 35, 25 55, 50 80 C75 55, 70 35, 50 20" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h2>北京绿道</h2>
            <p class="version">版本 {{ appVersion }}</p>
          </div>
          <div class="about-body">
            <p>北京绿道是一款专为骑行爱好者打造的绿道导览应用，提供北京市各区绿道信息查询、路线规划、社区互动等功能。</p>
            <p class="copyright">© 2024 北京绿道团队</p>
          </div>
          <button class="modal-close" @click="showAboutModal = false">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuth } from '@/stores/userAuth'

const router = useRouter()
const { isLoggedIn, logout, user } = useUserAuth()

// 设置状态
const darkMode = ref(false)
const fontSizeLevel = ref(1)
const fontSizeLabels = ['小', '标准', '大']
const notifyComments = ref(true)
const notifySystem = ref(true)
const notifyActivity = ref(false)
const cacheSize = ref('12.3 MB')
const appVersion = ref('1.0.0')
const showLanguage = ref(false)
const showAboutModal = ref(false)

const maskedPhone = computed(() => {
  if (!user.value?.phone) return ''
  const p = user.value.phone
  return p.slice(0, 3) + '****' + p.slice(-4)
})

function goBack() {
  router.back()
}

function editProfile() {
  alert('个人资料编辑功能即将上线')
}

function changePassword() {
  alert('修改密码功能即将上线')
}

function bindPhone() {
  alert('手机绑定功能即将上线')
}

function toggleDarkMode() {
  if (darkMode.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('theme', 'light')
  }
}

function decreaseFontSize() {
  if (fontSizeLevel.value > 0) {
    fontSizeLevel.value--
    applyFontSize()
  }
}

function increaseFontSize() {
  if (fontSizeLevel.value < 2) {
    fontSizeLevel.value++
    applyFontSize()
  }
}

function applyFontSize() {
  const sizes = ['14px', '16px', '18px']
  document.documentElement.style.setProperty('--base-font-size', sizes[fontSizeLevel.value])
  localStorage.setItem('fontSize', fontSizeLevel.value)
}

function showLanguageSheet() {
  showLanguage.value = true
}

function goDiagnostic() {
  router.push('/mobile/diagnostic')
}

function clearCache() {
  if (confirm('确定清除所有缓存数据吗？')) {
    localStorage.clear()
    sessionStorage.clear()
    cacheSize.value = '0 KB'
    alert('缓存已清除')
  }
}

function showPrivacyPolicy() {
  alert('隐私政策页面开发中')
}

function showUserAgreement() {
  alert('用户协议页面开发中')
}

function checkUpdate() {
  alert('当前已是最新版本')
}

function showFeedback() {
  alert('意见反馈功能即将上线')
}

function showAbout() {
  showAboutModal.value = true
}

function confirmLogout() {
  if (confirm('确定要退出登录吗？')) {
    logout()
    router.push('/mobile/login')
  }
}

onMounted(() => {
  // 恢复深色模式设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    darkMode.value = true
    document.documentElement.classList.add('dark-theme')
  }
  
  // 恢复字体大小设置
  const savedFontSize = localStorage.getItem('fontSize')
  if (savedFontSize !== null) {
    fontSizeLevel.value = parseInt(savedFontSize, 10)
    applyFontSize()
  }
})
</script>

<style scoped>
.settings-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

/* 顶部栏 */
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

/* 设置内容 */
.settings-content {
  padding: 16px;
}

.setting-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  padding-left: 4px;
}

.icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: #fff;
}
.icon-box.account { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.icon-box.general { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.icon-box.notify { background: linear-gradient(135deg, #f59e0b, #d97706); }
.icon-box.privacy { background: linear-gradient(135deg, #10b981, #059669); }
.icon-box.about { background: linear-gradient(135deg, #06b6d4, #0891b2); }

.setting-group {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 0.5px solid var(--color-divider);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.setting-item:last-child { border-bottom: none; }
.setting-item:active { background: var(--color-surface-2); }

.item-label {
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 30px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--color-surface-3);
  border-radius: 30px;
  transition: background var(--transition-normal);
}
.slider::before {
  content: '';
  position: absolute;
  height: 24px;
  width: 24px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
input:checked + .slider {
  background: var(--color-primary);
}
input:checked + .slider::before {
  transform: translateX(20px);
}

/* 字体大小控制 */
.font-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  padding: 4px;
}
.font-size-control button {
  width: 32px;
  height: 28px;
  border: none;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.font-size-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.font-level {
  font-size: var(--text-sm);
  min-width: 40px;
  text-align: center;
}

/* 退出登录 */
.logout-wrapper {
  padding: 32px 16px;
}
.logout-btn {
  width: 100%;
  padding: 16px;
  background: var(--fill-error);
  color: var(--color-error);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.logout-btn:active {
  opacity: 0.7;
}

/* Action Sheet */
.action-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn var(--transition-normal);
}
@keyframes fadeIn { from { opacity: 0; } }

.action-sheet {
  width: 100%;
  max-width: 500px;
  background: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  animation: slideUp var(--transition-normal);
}
@keyframes slideUp { from { transform: translateY(100%); } }

.sheet-header {
  padding: 20px 20px 12px;
  border-bottom: 0.5px solid var(--color-divider);
}
.sheet-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.sheet-options {
  padding: 8px 0;
}

.sheet-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  cursor: pointer;
}
.sheet-option:disabled {
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}
.sheet-option.active svg {
  color: var(--color-primary);
}
.sheet-option .coming {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  background: var(--color-surface-2);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.sheet-cancel {
  width: calc(100% - 32px);
  margin: 8px 16px 0;
  padding: 16px;
  background: var(--color-surface-2);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
}

/* 关于弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn var(--transition-normal);
}

.modal-content {
  width: 100%;
  max-width: 340px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  animation: scaleIn var(--transition-normal);
}
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } }

.about-modal .about-header {
  background: linear-gradient(135deg, var(--color-primary), #059669);
  padding: 32px 24px;
  text-align: center;
  color: #fff;
}
.about-header .app-icon {
  margin-bottom: 16px;
}
.about-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
}
.about-header .version {
  margin: 0;
  font-size: var(--text-sm);
  opacity: 0.9;
}

.about-body {
  padding: 24px;
  text-align: center;
}
.about-body p {
  margin: 0 0 16px;
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
}
.about-body .copyright {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.modal-close {
  width: 100%;
  padding: 16px;
  background: var(--color-surface-2);
  border: none;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}

.bottom-safe {
  height: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
