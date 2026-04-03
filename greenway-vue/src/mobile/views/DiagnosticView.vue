<template>
  <div class="diagnostic-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>网络诊断</h1>
      <button class="refresh-btn" @click="runAllTests">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </div>

    <div class="content">
      <!-- 基本信息 -->
      <section class="section">
        <h2>📱 基本信息</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="label">运行环境</span>
            <span class="value">{{ isCapacitor ? '✅ Capacitor App' : '🌐 Web浏览器' }}</span>
          </div>
          <div class="info-row">
            <span class="label">API地址</span>
            <span class="value mono" :class="{'highlight': apiBaseUrl}">{{ apiBaseUrl || '(使用相对路径)' }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前协议</span>
            <span class="value">{{ currentProtocol }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前主机</span>
            <span class="value">{{ currentHost }}</span>
          </div>
          <div class="info-row">
            <span class="label">时间戳</span>
            <span class="value">{{ new Date().toLocaleString('zh-CN') }}</span>
          </div>
        </div>
      </section>

      <!-- 快速操作 -->
      <section class="section">
        <h2>🔧 快速操作</h2>
        <div class="action-buttons">
          <button class="action-btn primary" @click="runAllTests" :disabled="testing">
            {{ testing ? '测试中...' : '🔄 重新测试所有' }}
          </button>
          <button class="action-btn" @click="testRealData">
            📊 测试真实数据
          </button>
          <button class="action-btn" @click="clearCache">
            🗑️ 清除缓存
          </button>
        </div>
      </section>

      <!-- 连接测试 -->
      <section class="section">
        <h2>🔌 连接测试</h2>
        <div class="test-list">
          <div class="test-item" v-for="test in tests" :key="test.name">
            <div class="test-header">
              <span class="test-name">{{ test.name }}</span>
              <span class="test-status" :class="test.status">
                {{ getStatusIcon(test.status) }} {{ getStatusText(test.status) }}
              </span>
            </div>
            <div class="test-url mono">{{ test.url }}</div>
            <div class="test-result" v-if="test.result">
              {{ test.result }}
            </div>
            <div class="test-error" v-if="test.error">
              ❌ {{ test.error }}
            </div>
            <div class="test-time" v-if="test.time">
              ⏱️ {{ test.time }}ms
            </div>
          </div>
        </div>
        <button class="test-btn" @click="runTests" :disabled="testing">
          {{ testing ? '测试中...' : '开始测试' }}
        </button>
      </section>

      <!-- 日志 -->
      <section class="section">
        <h2>请求日志</h2>
        <div class="logs">
          <div class="log-item" v-for="(log, idx) in logs" :key="idx" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </div>
          <div v-if="!logs.length" class="empty">暂无日志</div>
        </div>
        <button class="clear-btn" @click="clearLogs">清空日志</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApiBaseUrl } from '../services/api'

const router = useRouter()
const testing = ref(false)
const logs = ref([])

const isCapacitor = computed(() => {
  return typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform?.() ||
     window.location.protocol === 'capacitor:' ||
     (window.location.protocol === 'http:' && window.location.hostname === 'localhost'))
})

const apiBaseUrl = computed(() => getApiBaseUrl())
const currentProtocol = computed(() => window.location.protocol)
const currentHost = computed(() => window.location.host)

const tests = ref([
  { name: '后端健康检查', url: '', status: 'pending', result: '' },
  { name: '绿道数据API', url: '', status: 'pending', result: '' },
  { name: '网络连接', url: '', status: 'pending', result: '' }
])

function addLog(message, type = 'info') {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  logs.value.unshift({ time, message, type })
  if (logs.value.length > 50) logs.value.pop()
}

function getStatusText(status) {
  const map = {
    pending: '待测试',
    running: '测试中',
    success: '成功',
    failed: '失败'
  }
  return map[status] || status
}

function getStatusIcon(status) {
  const map = {
    pending: '⏸️',
    running: '🔄',
    success: '✅',
    failed: '❌'
  }
  return map[status] || '❓'
}

function clearLogs() {
  logs.value = []
  addLog('日志已清空', 'info')
}

function clearCache() {
  addLog('清除缓存...', 'info')
  // 清除localStorage
  if (window.localStorage) {
    const keys = Object.keys(window.localStorage)
    keys.forEach(key => {
      if (key.startsWith('greenway_') || key.includes('api_')) {
        window.localStorage.removeItem(key)
      }
    })
  }
  addLog('缓存已清除', 'success')
}

async function testRealData() {
  addLog('测试真实数据加载...', 'info')
  const baseUrl = getApiBaseUrl()
  
  try {
    const res = await fetch(`${baseUrl}/api/greenways`)
    if (res.ok) {
      const data = await res.json()
      const count = data?.features?.length || 0
      if (count > 0) {
        const first = data.features[0]
        addLog(`✅ 获取到${count}条绿道`, 'success')
        addLog(`第一条: ${first.properties?.name || '未命名'}`, 'info')
      } else {
        addLog('⚠️ 数据为空数组', 'warning')
      }
    } else {
      addLog(`❌ HTTP ${res.status}`, 'error')
    }
  } catch (err) {
    addLog(`❌ ${err.message}`, 'error')
  }
}

function goBack() {
  router.back()
}

async function runAllTests() {
  testing.value = true
  addLog('========== 开始完整诊断 ==========', 'info')
  
  const baseUrl = getApiBaseUrl()
  addLog(`API地址: ${baseUrl || '(相对路径)'}`, 'info')
  addLog(`运行环境: ${isCapacitor.value ? 'Capacitor App' : 'Web浏览器'}`, 'info')

  // 测试1: 健康检查
  tests.value[0].status = 'running'
  tests.value[0].url = `${baseUrl}/health`
  tests.value[0].error = ''
  tests.value[0].time = 0
  try {
    const start = Date.now()
    const res = await fetch(`${baseUrl}/health`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    const duration = Date.now() - start
    tests.value[0].time = duration
    
    if (res.ok) {
      const text = await res.text()
      tests.value[0].status = 'success'
      tests.value[0].result = `✅ 后端正常响应`
      addLog(`✅ 健康检查成功 (${duration}ms)`, 'success')
    } else {
      tests.value[0].status = 'failed'
      tests.value[0].result = `HTTP ${res.status}`
      tests.value[0].error = `HTTP状态码: ${res.status}`
      addLog(`❌ 健康检查失败: HTTP ${res.status}`, 'error')
    }
  } catch (err) {
    tests.value[0].status = 'failed'
    tests.value[0].result = '无法连接'
    tests.value[0].error = err.message
    addLog(`❌ 健康检查异常: ${err.message}`, 'error')
  }

  // 测试2: 绿道数据
  tests.value[1].status = 'running'
  tests.value[1].url = `${baseUrl}/api/greenways`
  tests.value[1].error = ''
  tests.value[1].time = 0
  try {
    const start = Date.now()
    const res = await fetch(`${baseUrl}/api/greenways`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    const duration = Date.now() - start
    tests.value[1].time = duration
    
    if (res.ok) {
      const data = await res.json()
      const count = data?.features?.length || 0
      tests.value[1].status = 'success'
      tests.value[1].result = `✅ 获取到 ${count} 条绿道数据`
      addLog(`✅ 绿道数据成功: ${count}条 (${duration}ms)`, 'success')
      if (count > 0) {
        addLog(`   示例: ${data.features[0].properties?.name || '未命名'}`, 'info')
      }
    } else {
      tests.value[1].status = 'failed'
      tests.value[1].result = `HTTP ${res.status}`
      tests.value[1].error = `HTTP状态码: ${res.status}`
      addLog(`❌ 绿道数据失败: HTTP ${res.status}`, 'error')
    }
  } catch (err) {
    tests.value[1].status = 'failed'
    tests.value[1].result = '无法连接'
    tests.value[1].error = err.message
    addLog(`❌ 绿道数据异常: ${err.message}`, 'error')
  }

  // 测试3: 网络连接状态
  tests.value[2].status = 'running'
  tests.value[2].url = 'Capacitor Network API'
  tests.value[2].error = ''
  try {
    if (window.Capacitor?.Plugins?.Network) {
      const status = await window.Capacitor.Plugins.Network.getStatus()
      tests.value[2].status = 'success'
      tests.value[2].result = `连接类型: ${status.connectionType}, 已连接: ${status.connected}`
      addLog(`✅ 网络状态: ${status.connectionType}`, 'info')
    } else {
      tests.value[2].status = 'success'
      tests.value[2].result = '网络API不可用 (非Native环境)'
      addLog('ℹ️ 网络API不可用', 'info')
    }
  } catch (err) {
    tests.value[2].status = 'failed'
    tests.value[2].result = '检查失败'
    tests.value[2].error = err.message
    addLog(`❌ 网络状态检查失败: ${err.message}`, 'error')
  }

  testing.value = false
  addLog('========== 诊断完成 ==========', 'info')
  
  // 总结
  const successCount = tests.value.filter(t => t.status === 'success').length
  const totalCount = tests.value.length
  if (successCount === totalCount) {
    addLog('🎉 所有测试通过！', 'success')
  } else {
    addLog(`⚠️ ${totalCount - successCount} 个测试失败`, 'warning')
  }
}

async function runTests() {
  // 兼容旧函数名
  await runAllTests()
}

onMounted(() => {
  addLog('网络诊断工具已加载', 'info')
  addLog(`运行环境: ${isCapacitor.value ? 'Capacitor App' : 'Web浏览器'}`, 'info')
  addLog(`API地址: ${apiBaseUrl.value || '(使用相对路径)'}`, 'info')
  addLog('点击"重新测试所有"按钮开始诊断', 'info')
})
      tests.value[2].status = 'success'
      tests.value[2].result = '在线 (Web环境)'
      addLog('网络状态: 在线 (Web环境)', 'info')
    }
  } catch (err) {
    tests.value[2].status = 'failed'
    tests.value[2].result = err.message
    addLog(`网络状态检查失败: ${err.message}`, 'error')
  }

  testing.value = false
  addLog('诊断测试完成', 'info')
}

onMounted(() => {
  addLog('网络诊断工具已加载', 'info')
  addLog(`运行环境: ${isCapacitor.value ? 'Capacitor' : 'Web'}`, 'info')
})
</script>

<style scoped>
.diagnostic-page {
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

.section {
  margin-bottom: 24px;
}
.section h2 {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 12px;
}

.info-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--color-divider);
}
.info-row:last-child { border: none; }
.info-row .label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.info-row .value {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}
.mono { 
  font-family: 'Courier New', monospace; 
  font-size: 11px;
}
.highlight {
  color: var(--color-primary);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-btn {
  padding: 14px 18px;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}
.action-btn:active {
  transform: scale(0.98);
  opacity: 0.8;
}
.action-btn.primary {
  background: var(--color-primary);
  color: white;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn {
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
  transition: transform 0.2s;
}
.refresh-btn:active {
  transform: rotate(180deg);
}

.test-list {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 12px;
}
.test-item {
  padding: 14px 16px;
  border-bottom: 0.5px solid var(--color-divider);
}
.test-item:last-child { border: none; }
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.test-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}
.test-status {
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}
.test-status.pending { background: var(--color-surface-2); color: var(--color-text-tertiary); }
.test-status.running { background: rgba(50, 173, 230, 0.12); color: var(--color-info); animation: pulse 1.5s ease-in-out infinite; }
.test-status.success { background: var(--fill-success); color: var(--color-success); }
.test-status.failed { background: var(--fill-error); color: var(--color-error); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.test-url, .test-result, .test-error, .test-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
  word-break: break-all;
  margin-top: 4px;
}
.test-result { color: var(--color-text-secondary); }
.test-error { 
  color: var(--color-error); 
  background: var(--fill-error);
  padding: 6px 8px;
  border-radius: 6px;
  margin-top: 6px;
}
.test-time {
  color: var(--color-success);
  font-weight: 600;
}

.test-btn, .clear-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
}
.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.clear-btn {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  margin-top: 12px;
}

.logs {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 12px;
}
.log-item {
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--color-divider);
  font-size: 12px;
  display: flex;
  gap: 10px;
}
.log-item:last-child { border: none; }
.log-time {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  font-family: monospace;
}
.log-msg {
  color: var(--color-text-secondary);
  flex: 1;
}
.log-item.success .log-msg { color: var(--color-success); }
.log-item.error .log-msg { color: var(--color-error); }
.log-item.info .log-msg { color: var(--color-text-primary); }
.empty {
  padding: 32px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}
</style>
