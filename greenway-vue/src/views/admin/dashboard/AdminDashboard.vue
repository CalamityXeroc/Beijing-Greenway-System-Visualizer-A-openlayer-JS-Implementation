<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">数据概览</h1>
      <p class="page-desc">北京绿道系统平台运营概况</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card" v-for="card in statCards" :key="card.key">
        <div class="stat-icon" :style="{ background: card.bg + '18', color: card.bg }">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               v-html="card.icon"/>
        </div>
        <div class="stat-body">
          <div class="stat-value">
            <span v-if="loading">—</span>
            <span v-else>{{ stats[card.key] ?? 0 }}</span>
          </div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
        <div class="stat-trend"><span class="trend-tag">实时</span></div>
      </div>
    </div>

    <!-- 登录趋势图 -->
    <div class="chart-section">
      <div class="section-header">
        <span class="section-title">登录趋势（近14天）</span>
        <button class="btn-sm" @click="loadTrend">刷新</button>
      </div>
      <div class="chart-card">
        <div v-if="trendLoading" class="chart-loading">
          <svg class="chart-spin" viewBox="0 0 50 50" width="32" height="32">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#2E7D32" stroke-width="4"
                    stroke-dasharray="90 30" stroke-linecap="round"/>
          </svg>
          <span>数据加载中…</span>
        </div>
        <div v-else-if="!trend.length" class="chart-empty">
          <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
            <rect x="8" y="40" width="12" height="16" rx="2" fill="#e5e7eb"/>
            <rect x="26" y="28" width="12" height="28" rx="2" fill="#d1d5db"/>
            <rect x="44" y="18" width="12" height="38" rx="2" fill="#9ca3af"/>
          </svg>
          <p>暂无登录数据</p>
        </div>
        <div v-else class="chart-header-row">
          <div class="chart-legend">
            <span class="legend-dot"></span><span class="legend-text">每日登录次数</span>
          </div>
          <div class="chart-total">近14天合计：<b>{{ trendTotal }}</b> 次</div>
        </div>
        <div v-show="!trendLoading && trend.length" ref="chartDom" class="chart-dom"></div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section-title" style="margin-top:24px">快捷管理</div>
    <div class="shortcut-grid">
      <div class="shortcut-card" @click="router.push('/admin/users')">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
             stroke="#2E7D32" stroke-width="1.8" stroke-linecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <div class="sc-label">用户管理</div>
        <div class="sc-desc">查看、编辑、禁用账户</div>
      </div>
      <div class="shortcut-card" @click="router.push('/admin/logs')">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
             stroke="#E65100" stroke-width="1.8" stroke-linecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <div class="sc-label">系统日志</div>
        <div class="sc-desc">查看登录和操作记录</div>
      </div>
      <div class="shortcut-card" @click="openFront">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
             stroke="#1565C0" stroke-width="1.8" stroke-linecap="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <div class="sc-label">访问前台</div>
        <div class="sc-desc">前往绿道地图主界面</div>
      </div>
      <div class="shortcut-card" @click="() => { loadStats(); loadTrend() }">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
             stroke="#7B1FA2" stroke-width="1.8" stroke-linecap="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <div class="sc-label">刷新数据</div>
        <div class="sc-desc">重新获取最新统计</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'
import * as echarts from 'echarts'

const router = useRouter()
const { apiFetch } = useAdminAuth()

const loading      = ref(true)
const trendLoading = ref(true)
const stats = ref({ totalUsers: 0, activeUsers: 0, totalGreenways: 0 })
const trend = ref([])

// ---- ECharts ----
const chartDom = ref(null)
let chartInst   = null
let resizeObs   = null
let themeObs    = null

const trendTotal = computed(() => trend.value.reduce((s, d) => s + (d.count || 0), 0))

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'night'
}

function buildChartOption() {
  const dark = isDarkTheme()
  const GREEN      = '#4CAF50'
  const GREEN_DIM  = 'rgba(76,175,80,0.08)'
  const GREEN_MID  = 'rgba(76,175,80,0.28)'
  const textColor  = dark ? '#9ca3af' : '#6b7280'
  const splitColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const axisColor  = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'
  const bgColor    = dark ? '#1e1e1e' : '#ffffff'

  const dates  = trend.value.map(d => d.day.slice(5))
  const counts = trend.value.map(d => d.count || 0)
  const maxVal = Math.max(1, ...counts)

  return {
    backgroundColor: bgColor,
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      backgroundColor: dark ? '#252525' : '#fff',
      borderColor: GREEN,
      borderWidth: 1,
      textStyle: { color: dark ? '#e8e8e8' : '#374151', fontSize: 13 },
      formatter(params) {
        const p = params[0]
        return `<div style="padding:2px 4px"><div style="color:${textColor};font-size:12px;margin-bottom:4px">${p.name}</div><div>登录次数 <b style="color:${GREEN};font-size:16px;margin-left:6px">${p.value}</b></div></div>`
      }
    },
    grid: { top: 16, left: 52, right: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: axisColor } },
      axisTick: { show: false },
      axisLabel: {
        color: textColor, fontSize: 11,
        interval: dates.length > 10 ? 1 : 0,
        formatter: v => v
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: Math.ceil(maxVal * 1.2) || 5,
      minInterval: 1,
      splitLine: { lineStyle: { color: splitColor, type: 'dashed' } },
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'line',
      data: counts,
      smooth: 0.4,
      symbol: 'circle',
      symbolSize: 7,
      showAllSymbol: true,
      itemStyle: { color: GREEN, borderColor: bgColor, borderWidth: 2 },
      lineStyle: { color: GREEN, width: 2.5, shadowColor: 'rgba(76,175,80,0.3)', shadowBlur: 6 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: GREEN_MID },
          { offset: 1, color: GREEN_DIM }
        ])
      },
      emphasis: {
        focus: 'series',
        itemStyle: { symbolSize: 10 }
      },
      markPoint: maxVal > 0 ? {
        data: [{ type: 'max', name: '峰值' }],
        symbol: 'pin',
        symbolSize: 36,
        itemStyle: { color: GREEN },
        label: { color: '#fff', fontSize: 11 }
      } : undefined
    }]
  }
}

function initChart() {
  if (!chartDom.value || chartInst) return
  chartInst = echarts.init(chartDom.value)
  refreshChart()
}

function refreshChart() {
  if (!chartInst) return
  chartInst.setOption(buildChartOption(), { notMerge: true })
}

watch(trend, async () => {
  await nextTick()          // 等 v-show 生效（chartDom 变为可见）
  if (!trend.value.length) return
  if (!chartInst) initChart()
  else refreshChart()
  await nextTick()
  chartInst?.resize()      // 修正 v-show 切换后的尺寸
})

const statCards = [
  {
    key: 'totalUsers', label: '注册用户总数', bg: '#2E7D32',
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
           <circle cx="9" cy="7" r="4"/>
           <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
           <path d="M16 3.13a4 4 0 0 1 0 7.75"/>`
  },
  {
    key: 'activeUsers', label: '活跃用户数', bg: '#1565C0',
    icon: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`
  },
  {
    key: 'totalGreenways', label: '绿道路线总数', bg: '#6A1493',
    icon: `<line x1="3" y1="12" x2="21" y2="12"/>
           <line x1="3" y1="6"  x2="21" y2="6"/>
           <line x1="3" y1="18" x2="21" y2="18"/>`
  }
]

async function loadStats() {
  loading.value = true
  try {
    const json = await apiFetch('/api/admin/stats')
    stats.value = json.data
  } catch (e) { console.warn('stats failed', e) }
  finally { loading.value = false }
}

async function loadTrend() {
  trendLoading.value = true
  try {
    const json = await apiFetch('/api/admin/stats/trend?days=14')
    trend.value = json.data || []
  } catch (e) { console.warn('trend failed', e) }
  finally { trendLoading.value = false }
}

function openFront() { window.open('/', '_blank') }

let _resizeHandler = null

onMounted(() => {
  loadStats()
  loadTrend()

  // 主题变化时重绘
  themeObs = new MutationObserver(() => { if (chartInst) refreshChart() })
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  // 窗口resize时自适应
  _resizeHandler = () => chartInst?.resize()
  window.addEventListener('resize', _resizeHandler)
})

onUnmounted(() => {
  resizeObs?.disconnect()
  themeObs?.disconnect()
  if (_resizeHandler) window.removeEventListener('resize', _resizeHandler)
  chartInst?.dispose()
  chartInst = null
})
</script>

<style scoped>
.dashboard { max-width: 1100px; }

.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc   { font-size: 0.875rem; color: #6b7280; margin: 0; }

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}
.stat-icon {
  width: 52px; height: 52px; flex: 0 0 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.stat-body { flex: 1; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #111827; line-height: 1; margin-bottom: 4px; }
.stat-label { font-size: 0.82rem; color: #6b7280; }
.stat-trend { margin-left: auto; }
.trend-tag {
  font-size: 0.72rem; color: #2E7D32;
  background: #e8f5e9; padding: 2px 8px; border-radius: 20px;
}

/* 快捷入口 */
.section-title {
  font-size: 1rem; font-weight: 700; color: #374151;
  margin-bottom: 14px;
}
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.shortcut-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s, transform 0.2s;
  text-align: center;
}
.shortcut-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.10);
  transform: translateY(-2px);
}
.sc-label { font-size: 0.9rem; font-weight: 700; color: #111827; margin: 10px 0 4px; }
.sc-desc  { font-size: 0.78rem; color: #9ca3af; }

/* 趋势图 */
.chart-section { margin-bottom: 8px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.btn-sm {
  padding: 4px 12px; border-radius: 6px; border: 1px solid #e5e7eb;
  background: #fff; font-size: 0.8rem; cursor: pointer; color: #6b7280;
}
.btn-sm:hover { border-color: #2E7D32; color: #2E7D32; }
.chart-card {
  background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
  padding: 16px 16px 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  min-height: 240px; display: flex; flex-direction: column;
}
.chart-loading {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  flex: 1; gap: 10px; color: #9ca3af; font-size: 0.875rem;
}
.chart-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.chart-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  flex: 1; gap: 8px; color: #9ca3af; font-size: 0.875rem;
}
.chart-empty p { margin: 0; }
.chart-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.chart-legend { display: flex; align-items: center; gap: 6px; }
.legend-dot {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  background: #4CAF50;
}
.legend-text { font-size: 0.82rem; color: #6b7280; }
.chart-total { font-size: 0.82rem; color: #6b7280; }
.chart-total b { color: #2E7D32; }
.chart-dom { width: 100%; height: 210px; }

/* ===== 夜间模式 ===== */
[data-theme="night"] .page-title { color: #e8e8e8; }
[data-theme="night"] .page-desc  { color: #9ca3af; }
[data-theme="night"] .stat-card {
  background: #1e1e1e;
  border: 1px solid #2a2a2a;
  box-shadow: 0 2px 8px rgba(0,0,0,.3);
}
[data-theme="night"] .stat-value { color: #e8e8e8; }
[data-theme="night"] .stat-label { color: #9ca3af; }
[data-theme="night"] .stat-trend-up { background: rgba(34,197,94,.15); color: #4ade80; }
[data-theme="night"] .chart-card {
  background: #1e1e1e;
  border-color: #2a2a2a;
  box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
[data-theme="night"] .section-title { color: #e8e8e8; }
[data-theme="night"] .btn-sm {
  background: #252525; border-color: #3a3a3a; color: #9ca3af;
}
[data-theme="night"] .btn-sm:hover { border-color: #4CAF50; color: #A5D6A7; }
[data-theme="night"] .sc-label { color: #e8e8e8; }
[data-theme="night"] .sc-desc  { color: #6b7280; }
[data-theme="night"] .shortcut-card {
  background: #1e1e1e; border-color: #2a2a2a; color: #9ca3af;
}
[data-theme="night"] .shortcut-card:hover { background: #252525; }
</style>
