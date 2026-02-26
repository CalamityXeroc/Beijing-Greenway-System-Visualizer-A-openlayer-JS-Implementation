<template>
  <nav class="top-navbar" :class="{ 'theme-night': isNight }">
    <!-- 左：Logo + 标题 -->
    <div class="nav-brand">
      <div class="brand-logo">
        <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
          <circle cx="20" cy="20" r="20" fill="#2E7D32"/>
          <path d="M8 30 Q13 10 20 20 Q27 30 32 12" stroke="#A5D6A7" stroke-width="2.5"
                fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="20" cy="20" r="3.5" fill="#E8F5E9"/>
          <circle cx="13" cy="24" r="2" fill="#81C784"/>
          <circle cx="27" cy="16" r="2" fill="#81C784"/>
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-title">北京绿道可视化平台</span>
        <span class="brand-sub">Beijing Greenway Visualization</span>
      </div>
    </div>

    <!-- 中：工具菜单 -->
    <div class="nav-tools" v-if="toolbarRef">
      <!-- 绘制工具 -->
      <div class="nav-item" :class="{ 'has-active': isDrawActive }"
           @mouseenter="openMenu('draw')" @mouseleave="closeMenu('draw')">
        <button class="nav-btn" :class="{ active: isDrawActive }">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          绘制
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dropdown" v-show="openMenuId === 'draw'">
          <div class="dropdown-section">绘制图形</div>
          <button class="dd-btn" :class="{ active: toolbarRef.activeTool?.value === 'point' }"
                  @click="callTool('activateDrawTool', 'point')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
            </svg>
            点
          </button>
          <button class="dd-btn" :class="{ active: toolbarRef.activeTool?.value === 'line' }"
                  @click="callTool('activateDrawTool', 'line')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="19" x2="19" y2="5"/>
            </svg>
            线
          </button>
          <button class="dd-btn" :class="{ active: toolbarRef.activeTool?.value === 'polygon' }"
                  @click="callTool('activateDrawTool', 'polygon')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 22 20 2 20"/>
            </svg>
            面
          </button>
          <div class="dd-divider"/>
          <button class="dd-btn dd-btn--danger" @click="callTool('clearDrawings')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
            清除绘制
          </button>
        </div>
      </div>

      <!-- 测量工具 -->
      <div class="nav-item" :class="{ 'has-active': isMeasureActive }"
           @mouseenter="openMenu('measure')" @mouseleave="closeMenu('measure')">
        <button class="nav-btn" :class="{ active: isMeasureActive }">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4"/>
          </svg>
          测量
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dropdown" v-show="openMenuId === 'measure'">
          <div class="dropdown-section">测量类型</div>
          <button class="dd-btn" :class="{ active: toolbarRef.activeTool?.value === 'measure-length' }"
                  @click="callTool('activateMeasureTool', 'length')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <line x1="5" y1="8" x2="5" y2="16"/>
              <line x1="19" y1="8" x2="19" y2="16"/>
            </svg>
            测距离
          </button>
          <button class="dd-btn" :class="{ active: toolbarRef.activeTool?.value === 'measure-area' }"
                  @click="callTool('activateMeasureTool', 'area')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="1"/>
            </svg>
            测面积
          </button>
          <div class="dd-divider"/>
          <button class="dd-btn dd-btn--danger" @click="callTool('clearMeasurements')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
            清除测量
          </button>
        </div>
      </div>

      <!-- 图层管理 -->
      <div class="nav-item"
           @mouseenter="openMenu('layers')" @mouseleave="closeMenu('layers')">
        <button class="nav-btn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          图层
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dropdown dropdown--wide" v-show="openMenuId === 'layers'">
          <div class="dropdown-section">图层控制</div>
          <div v-for="layer in filteredLayerConfig" :key="layer.id"
               class="dd-layer-item">
            <label class="layer-check">
              <input type="checkbox" :checked="layer.visible !== false"
                     @change="callTool('toggleBaseLayer', layer.id, $event.target.checked)"/>
              <span class="checkmark"/>
              <span>{{ layer.name }}</span>
            </label>
          </div>
          <div v-if="!filteredLayerConfig.length" class="dd-empty">暂无图层</div>
          <div class="dd-divider"/>
          <!-- 上传自定义 -->
          <div class="dropdown-section">自定义图层</div>
          <button class="dd-btn dd-btn--upload" @click="triggerUpload">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            上传 GeoJSON
          </button>
          <input ref="fileInputRef" type="file" accept=".geojson,.json"
                 style="display:none" @change="onFileChange"/>
          <div v-for="(layer, idx) in toolbarRef.customLayers?.value || []" :key="idx"
               class="dd-layer-item">
            <label class="layer-check">
              <input type="checkbox" :checked="layer.visible"
                     @change="callTool('toggleCustomLayer', idx)"/>
              <span class="checkmark"/>
              <span>{{ layer.name }}</span>
            </label>
            <button class="dd-del" @click.stop="callTool('removeCustomLayer', idx)">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 地图主题 -->
      <div class="nav-item"
           @mouseenter="openMenu('theme')" @mouseleave="closeMenu('theme')">
        <button class="nav-btn">
          <svg v-if="!isNight" viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          主题
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="dropdown" v-show="openMenuId === 'theme'">
          <div class="dropdown-section">地图主题</div>
          <button class="dd-btn" :class="{ active: !isNight }"
                  @click="callTool('switchTheme', 'day')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            </svg>
            日间模式
          </button>
          <button class="dd-btn" :class="{ active: isNight }"
                  @click="callTool('switchTheme', 'night')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            夜间模式
          </button>
        </div>
      </div>
    </div>

    <!-- 右：登录入口 -->
    <div class="nav-right">
      <div class="user-menu" @mouseenter="openMenu('user')" @mouseleave="closeMenu('user')">
        <!-- 未登录 -->
        <button v-if="!userAuth.isLoggedIn.value" class="user-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>登录 / 注册</span>
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <!-- 已登录 -->
        <button v-else class="user-btn user-btn--loggedin">
          <span class="avatar">{{ userAuth.nickname.value?.[0] || 'U' }}</span>
          <span>{{ userAuth.nickname.value }}</span>
          <svg class="chevron" viewBox="0 0 24 24" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div class="dropdown dropdown--right" v-show="openMenuId === 'user'">
          <template v-if="!userAuth.isLoggedIn.value">
            <div class="dropdown-section">欢迎使用</div>
            <a class="dd-btn" href="/login">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              用户登录
            </a>
            <a class="dd-btn" href="/register">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              用户注册
            </a>
            <!-- 仅管理员已登录时显示「进入后台」入口 -->
            <template v-if="adminIsLoggedIn">
              <div class="dd-divider"/>
              <a class="dd-btn dd-btn--admin" href="/admin/dashboard">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                进入管理后台
              </a>
            </template>
          </template>
          <template v-else>
            <div class="dd-user-header">
              <span class="dd-avatar-lg">{{ userAuth.nickname.value?.[0] || 'U' }}</span>
              <div>
                <div class="dd-uname">{{ userAuth.nickname.value }}</div>
                <div class="dd-usub">@{{ userAuth.username.value }}</div>
              </div>
            </div>
            <div class="dd-divider"/>
            <!-- 管理员同时也登录了前台账号时，在此显示进入后台 -->
            <template v-if="adminIsLoggedIn">
              <a class="dd-btn dd-btn--admin" href="/admin/dashboard">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                进入管理后台
              </a>
              <div class="dd-divider"/>
            </template>
            <button class="dd-btn dd-btn--danger" @click="handleLogout">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              退出登录
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserAuth } from '@/stores/userAuth'
import { useAdminAuth } from '@/stores/adminAuth'
import { useGlobalTheme } from '@/utils/useTheme'

const props = defineProps({
  toolbarRef: { type: Object, default: null },
  layerConfig: { type: Array, default: () => [] }
})

// 过滤掉所有绿道路线图层，只保留北京市界/面等底图图层
const GREENWAY_IDS = [
  'wenyu-greenway', 'huanerhuan-greenway', 'liangmahe-greenway',
  'changying-greenway', 'changping42-greenway', 'lidu-greenway',
  'beiyunhe-greenway', 'nansha-greenway', 'aosen-greenway',
  'yingcheng-greenway', 'sanshan-greenway', 'chaoyang-greenway'
]
const filteredLayerConfig = computed(() =>
  props.layerConfig.filter(l => !GREENWAY_IDS.includes(l.id))
)

const userAuth = useUserAuth()
const { isLoggedIn: adminIsLoggedIn } = useAdminAuth()
const openMenuId = ref(null)
const fileInputRef = ref(null)

// 主题状态：读取全局主题，不依赖 toolbarRef
const { theme: globalTheme } = useGlobalTheme()
const isNight = computed(() => globalTheme.value === 'night')
// 绘制激活状态
const isDrawActive = computed(() => {
  const t = props.toolbarRef?.activeTool?.value
  return t === 'point' || t === 'line' || t === 'polygon'
})
const isMeasureActive = computed(() => {
  const t = props.toolbarRef?.activeTool?.value
  return t === 'measure-length' || t === 'measure-area'
})

let closeTimer = null

function openMenu(id) {
  clearTimeout(closeTimer)
  openMenuId.value = id
}
function closeMenu() {
  closeTimer = setTimeout(() => { openMenuId.value = null }, 120)
}

// 调用工具栏方法
function callTool(method, ...args) {
  if (props.toolbarRef && typeof props.toolbarRef[method] === 'function') {
    props.toolbarRef[method](...args)
  }
}

function triggerUpload() {
  fileInputRef.value?.click()
}
function onFileChange(e) {
  // 构造一个假事件转发给 handleFileUpload（模拟）
  if (props.toolbarRef && typeof props.toolbarRef.handleFileUpload === 'function') {
    props.toolbarRef.handleFileUpload(e)
  }
}

function handleLogout() {
  userAuth.clearSession()
  openMenuId.value = null
}
</script>

<style scoped>
.top-navbar {
  height: 64px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.97);
  border-bottom: 2px solid rgba(46, 125, 50, 0.15);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2000;
  flex-shrink: 0;
  gap: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 夜间主题 */
.top-navbar.theme-night {
  background: rgba(18, 30, 20, 0.97);
  border-bottom-color: rgba(76, 175, 80, 0.2);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
}
.top-navbar.theme-night .brand-title { color: #A5D6A7; }
.top-navbar.theme-night .brand-sub   { color: #4CAF50; }
.top-navbar.theme-night .nav-btn     { color: #81C784; }
.top-navbar.theme-night .nav-btn:hover,
.top-navbar.theme-night .nav-btn.active { background: rgba(76,175,80,.15); color: #A5D6A7; }
.top-navbar.theme-night .has-active .nav-btn { color: #69F0AE; }
.top-navbar.theme-night .dropdown    { background: #1a2e1a; border-color: rgba(76,175,80,.2); }
.top-navbar.theme-night .dd-btn      { color: #81C784; }
.top-navbar.theme-night .dd-btn:hover{ background: rgba(76,175,80,.12); }
.top-navbar.theme-night .dropdown-section { color: #4CAF50; }
.top-navbar.theme-night .user-btn    { color: #81C784; border-color: rgba(76,175,80,.3); }

/* === Brand === */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-right: 24px;
}
.brand-logo { display: flex; align-items: center; }
.brand-text  { display: flex; flex-direction: column; line-height: 1.1; }
.brand-title { font-size: 1.05rem; font-weight: 800; color: #1B5E20; letter-spacing: 1px; white-space: nowrap; }
.brand-sub   { font-size: 0.62rem; color: #81C784; font-weight: 400; letter-spacing: 0.5px; }

/* === Tool nav center === */
.nav-tools {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-item {
  position: relative;
}

.nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; height: 40px; border-radius: 8px;
  border: none; background: transparent;
  font-size: 0.875rem; font-weight: 500; color: #374151;
  cursor: pointer; white-space: nowrap; transition: all .18s;
}
.nav-btn:hover, .nav-btn.active {
  background: rgba(46, 125, 50, 0.08);
  color: #2E7D32;
}
.nav-btn.active {
  background: rgba(46, 125, 50, 0.12);
  color: #2E7D32;
  font-weight: 600;
}
.has-active .nav-btn { color: #2E7D32; font-weight: 600; }
.chevron { opacity: .5; flex-shrink: 0; }

/* === Dropdown === */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
  z-index: 9999;
  padding: 6px 0;
}
.dropdown--wide { min-width: 200px; }
.dropdown--right { left: auto; right: 0; }

.dropdown-section {
  padding: 6px 14px 4px;
  font-size: 0.7rem; font-weight: 700;
  color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px;
}

.dd-btn {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 9px 14px;
  background: none; border: none; cursor: pointer;
  font-size: 0.875rem; color: #374151;
  text-decoration: none; text-align: left;
  transition: background .14s;
}
.dd-btn:hover { background: #f9fafb; }
.dd-btn.active { background: #ecfdf5; color: #065f46; font-weight: 600; }
.dd-btn--danger { color: #dc2626; }
.dd-btn--danger:hover { background: #fef2f2; }
.dd-btn--admin  { color: #7c3aed; }
.dd-btn--upload { color: #d97706; }
.dd-btn--upload:hover { background: #fffbeb; }

.dd-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }
.dd-empty { padding: 8px 14px; font-size: 0.8rem; color: #9ca3af; }

/* Layer checkbox rows */
.dd-layer-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2px 14px;
}
.layer-check {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 0.875rem; color: #374151;
  padding: 6px 0; flex: 1;
}
.layer-check input[type="checkbox"] { accent-color: #2E7D32; width: 15px; height: 15px; cursor: pointer; }
.checkmark { display: none; } /* using native checkbox */
.dd-del {
  background: none; border: none; cursor: pointer; color: #9ca3af; padding: 3px;
  border-radius: 4px; line-height: 0; transition: color .15s;
}
.dd-del:hover { color: #dc2626; }

/* === Right user menu === */
.nav-right { margin-left: auto; flex-shrink: 0; }
.user-menu { position: relative; }

.user-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px; height: 40px; border-radius: 20px;
  border: 1.5px solid rgba(46,125,50,.3);
  background: rgba(46,125,50,.04);
  font-size: 0.875rem; font-weight: 600; color: #2E7D32;
  cursor: pointer; transition: all .18s; white-space: nowrap;
}
.user-btn:hover {
  background: rgba(46,125,50,.1); border-color: #2E7D32;
}
.user-btn--loggedin { background: rgba(46,125,50,.06); border-color: rgba(46,125,50,.4); }
.avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: #2E7D32; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
/* user dropdown header */
.dd-user-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px 8px;
}
.dd-avatar-lg {
  width: 36px; height: 36px; border-radius: 50%;
  background: #2E7D32; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.dd-uname { font-size: 0.875rem; font-weight: 700; color: #111827; }
.dd-usub  { font-size: 0.78rem; color: #9ca3af; }
</style>
