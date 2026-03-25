<template>
  <div class="comment-admin-page">
    <div class="page-header">
      <h1 class="page-title">评论审核管理</h1>
      <p class="page-desc">筛选、审核与批量处理用户评论</p>
    </div>

    <div class="stats-row" v-if="statsReady">
      <div class="chart-card">
        <div class="card-title">近 30 天评论趋势</div>
        <v-chart class="chart-line" :option="trendOption" autoresize />
      </div>
      <div class="chart-card pie-card">
        <div class="card-title">评论状态分布</div>
        <v-chart class="chart-pie" :option="pieOption" autoresize />
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model.trim="query.keyword" class="ipt" placeholder="按评论内容关键词搜索" @input="debouncedLoad" />
        <input v-model.trim="query.userKeyword" class="ipt" placeholder="按用户ID/昵称搜索" @input="debouncedLoad" />
        <select v-model="query.status" class="sel" @change="loadList">
          <option value="">全部状态</option>
          <option value="pending">审核中</option>
          <option value="visible">正常</option>
          <option value="hidden">已下架</option>
        </select>
      </div>
      <div class="toolbar-right">
        <button type="button" class="btn" @click="loadList">刷新</button>
      </div>
    </div>

    <div class="batch-bar" v-if="selectedIds.length">
      <span>已选 {{ selectedIds.length }} 条</span>
      <button type="button" class="batch-btn ok" @click="batchUpdate('visible')">批量通过</button>
      <button type="button" class="batch-btn warn" @click="batchUpdate('hidden')">批量下架</button>
      <button type="button" class="batch-btn info" @click="batchUpdate('pending')">批量改为审核中</button>
      <button type="button" class="batch-btn" @click="clearSelection">清空选择</button>
    </div>

    <div class="table-wrap">
      <div v-if="loading" class="table-loading">加载中...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th style="width:42px;"><input type="checkbox" :checked="isAllChecked" @change="toggleAll" /></th>
            <th>ID</th>
            <th>所属绿道</th>
            <th>评论内容</th>
            <th>发布用户</th>
            <th>发布时间</th>
            <th>状态</th>
            <th>点赞</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td><input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleOne(item.id)" /></td>
            <td>#{{ item.id }}</td>
            <td>{{ item.greenway_name || `绿道#${item.greenway_id}` }}</td>
            <td class="content-col" :title="item.content">{{ item.content }}</td>
            <td>{{ item.nickname || item.username || `用户#${item.user_id}` }}</td>
            <td>{{ formatDateTime(item.created_at) }}</td>
            <td>
              <span class="status-tag" :class="item.status">{{ statusLabel(item.status) }}</span>
            </td>
            <td>{{ item.like_count || 0 }}</td>
            <td class="actions">
              <button type="button" v-if="item.status === 'pending'" class="act-btn ok" @click="updateStatus(item.id, 'visible')">通过</button>
              <button type="button" v-if="item.status !== 'hidden'" class="act-btn warn" @click="updateStatus(item.id, 'hidden')">下架</button>
              <button type="button" v-if="item.status === 'hidden'" class="act-btn info" @click="updateStatus(item.id, 'visible')">恢复</button>
            </td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="9" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="!loading">
      <span class="pg-info">共 {{ total }} 条，第 {{ query.page }}/{{ totalPages }} 页</span>
      <div class="pg-btns">
        <button type="button" class="pg-btn" :disabled="query.page <= 1" @click="goPage(query.page - 1)">上一页</button>
        <button type="button" v-for="p in visiblePages" :key="p" class="pg-btn" :class="{ active: p === query.page }" @click="goPage(p)">{{ p }}</button>
        <button type="button" class="pg-btn" :disabled="query.page >= totalPages" @click="goPage(query.page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useAdminAuth } from '@/stores/adminAuth'
import { useGlobalTheme } from '@/utils/useTheme'

use([CanvasRenderer, PieChart, LineChart, GridComponent, TooltipComponent, LegendComponent])

const { apiFetch } = useAdminAuth()
const { theme } = useGlobalTheme()
const isDark = computed(() => theme.value === 'night')

const loading = ref(false)
const statsReady = ref(false)
const list = ref([])
const total = ref(0)
const selectedIds = ref([])
const trend = ref([])
const distribution = ref({ pending: 0, visible: 0, hidden: 0 })

const query = ref({
  keyword: '',
  userKeyword: '',
  status: '',
  page: 1,
  pageSize: 15
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.value.pageSize)))
const visiblePages = computed(() => {
  const cur = query.value.page
  const max = totalPages.value
  const pages = []
  for (let p = Math.max(1, cur - 2); p <= Math.min(max, cur + 2); p += 1) pages.push(p)
  return pages
})

const isAllChecked = computed(() => list.value.length > 0 && list.value.every((item) => selectedIds.value.includes(item.id)))

const trendOption = computed(() => {
  const dark = isDark.value
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 45, right: 12, top: 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: trend.value.map((i) => i.day),
      axisLabel: { color: dark ? '#9ca3af' : '#6b7280', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: dark ? '#9ca3af' : '#6b7280', fontSize: 11 },
      splitLine: { lineStyle: { color: dark ? '#2a2a2a' : '#f1f5f9' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: trend.value.map((i) => Number(i.count)),
      itemStyle: { color: dark ? '#4ade80' : '#2E7D32' },
      lineStyle: { color: dark ? '#4ade80' : '#2E7D32', width: 2 }
    }]
  }
})

const pieOption = computed(() => {
  const dark = isDark.value
  return {
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 2,
      textStyle: { color: dark ? '#9ca3af' : '#6b7280' }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '42%'],
      data: [
        { value: distribution.value.visible, name: '正常' },
        { value: distribution.value.pending, name: '审核中' },
        { value: distribution.value.hidden, name: '已下架' }
      ],
      color: ['#2E7D32', '#1D4ED8', '#F59E0B']
    }]
  }
})

function statusLabel(status) {
  if (status === 'pending') return '审核中'
  if (status === 'visible') return '正常'
  if (status === 'hidden') return '已下架'
  return status || '未知'
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadStats() {
  try {
    const res = await apiFetch('/api/admin/comments/stats?days=30')
    trend.value = res.data?.trend || []
    distribution.value = res.data?.statusDistribution || { pending: 0, visible: 0, hidden: 0 }
    statsReady.value = true
  } catch {
    statsReady.value = false
  }
}

async function loadList() {
  loading.value = true
  try {
    const q = new URLSearchParams({
      keyword: query.value.keyword,
      userKeyword: query.value.userKeyword,
      status: query.value.status,
      page: String(query.value.page),
      pageSize: String(query.value.pageSize)
    })
    const res = await apiFetch(`/api/admin/comments?${q.toString()}`)
    list.value = res.data?.list || []
    total.value = Number(res.data?.total || 0)
  } catch (err) {
    alert(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

let searchTimer = null
function debouncedLoad() {
  clearTimeout(searchTimer)
  query.value.page = 1
  searchTimer = setTimeout(loadList, 350)
}

function goPage(p) {
  query.value.page = p
  loadList()
}

function toggleOne(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function toggleAll(e) {
  const checked = e.target.checked
  if (checked) {
    selectedIds.value = list.value.map((item) => item.id)
  } else {
    selectedIds.value = []
  }
}

function clearSelection() {
  selectedIds.value = []
}

function getAdminScrollContainer() {
  return document.querySelector('.page-content') || document.scrollingElement || document.documentElement
}

async function withPreservedScroll(task) {
  const scroller = getAdminScrollContainer()
  const top = scroller?.scrollTop || 0
  await task()
  await nextTick()
  if (scroller) scroller.scrollTop = top
}

async function updateStatus(id, status) {
  try {
    await withPreservedScroll(async () => {
      await apiFetch(`/api/admin/comments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      await Promise.all([loadList(), loadStats()])
    })
  } catch (err) {
    alert(err.message || '操作失败')
  }
}

async function batchUpdate(status) {
  if (!selectedIds.value.length) return
  try {
    await withPreservedScroll(async () => {
      await apiFetch('/api/admin/comments/batch/status', {
        method: 'PATCH',
        body: JSON.stringify({ ids: selectedIds.value, status })
      })
      clearSelection()
      await Promise.all([loadList(), loadStats()])
    })
  } catch (err) {
    alert(err.message || '批量操作失败')
  }
}

onMounted(async () => {
  await Promise.all([loadList(), loadStats()])
})
</script>

<style scoped>
.comment-admin-page { max-width: 1280px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0 0 6px; font-size: 1.45rem; color: #111827; }
.page-desc { margin: 0; color: #6b7280; font-size: 0.9rem; }

.stats-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.chart-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
}
.card-title { font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
.chart-line { height: 220px; }
.chart-pie { height: 220px; }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.toolbar-left { display: flex; gap: 8px; flex-wrap: wrap; }
.ipt, .sel {
  height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
}
.ipt { min-width: 220px; }
.btn {
  height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  padding: 0 12px;
  cursor: pointer;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 13px;
}
.batch-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}
.batch-btn.ok { color: #166534; border-color: #86efac; background: #f0fdf4; }
.batch-btn.warn { color: #92400e; border-color: #fcd34d; background: #fffbeb; }
.batch-btn.info { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }

.table-wrap {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow-x: auto;
}
.table-loading { padding: 34px; text-align: center; color: #6b7280; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  font-size: 12px;
  color: #6b7280;
  background: #f8fafc;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.data-table td {
  font-size: 13px;
  color: #374151;
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.content-col { max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-row { text-align: center; color: #9ca3af; padding: 20px; }
.actions { display: flex; gap: 6px; }
.act-btn {
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
}
.act-btn.ok { color: #166534; background: #f0fdf4; border-color: #86efac; }
.act-btn.warn { color: #92400e; background: #fffbeb; border-color: #fcd34d; }
.act-btn.info { color: #1d4ed8; background: #eff6ff; border-color: #93c5fd; }

.status-tag {
  font-size: 12px;
  border-radius: 999px;
  padding: 2px 9px;
  display: inline-block;
}
.status-tag.pending { color: #1d4ed8; background: #dbeafe; }
.status-tag.visible { color: #166534; background: #dcfce7; }
.status-tag.hidden { color: #92400e; background: #fef3c7; }

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pg-info { font-size: 12px; color: #6b7280; }
.pg-btns { display: flex; gap: 6px; }
.pg-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
.pg-btn.active { background: #2E7D32; color: #fff; border-color: #2E7D32; }
.pg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

:global([data-theme="night"] .comment-admin-page .page-title) { color: #e5e7eb; }
:global([data-theme="night"] .comment-admin-page .page-desc) { color: #9ca3af; }
:global([data-theme="night"] .comment-admin-page .chart-card),
:global([data-theme="night"] .comment-admin-page .toolbar),
:global([data-theme="night"] .comment-admin-page .table-wrap) {
  background: #1a1a1a;
  border-color: #2f2f2f;
}
:global([data-theme="night"] .comment-admin-page .data-table th) {
  background: #222;
  color: #9ca3af;
  border-bottom-color: #2f2f2f;
}
:global([data-theme="night"] .comment-admin-page .data-table td) {
  color: #d1d5db;
  border-bottom-color: #2a2a2a;
}
:global([data-theme="night"] .comment-admin-page .ipt),
:global([data-theme="night"] .comment-admin-page .sel),
:global([data-theme="night"] .comment-admin-page .btn),
:global([data-theme="night"] .comment-admin-page .pg-btn) {
  background: #111;
  border-color: #3a3a3a;
  color: #d1d5db;
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: 1fr; }
  .pie-card { order: -1; }
}
</style>
