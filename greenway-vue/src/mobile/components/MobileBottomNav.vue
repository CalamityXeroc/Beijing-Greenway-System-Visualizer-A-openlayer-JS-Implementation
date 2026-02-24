<template>
  <nav class="bottom-nav">
    <div class="nav-inner">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-tab"
        :class="{ active: activeTab === item.id }"
        @click="handleTabChange(item.id)"
        :aria-label="item.label"
      >
        <!-- 活跃态胶囊背景 -->
        <span class="tab-pill" v-if="activeTab === item.id"></span>
        <!-- SVG 图标 -->
        <span class="tab-icon" v-html="item.svg"></span>
        <span class="tab-label">{{ item.label }}</span>
      </button>
    </div>
    <!-- 底部安全区域填充 -->
    <div class="safe-fill"></div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  modelValue: { type: String, default: 'map' }
})
const emit = defineEmits(['update:modelValue', 'change'])

const activeTab = ref(props.modelValue)

const navItems = [
  {
    id: 'map', label: '地图', path: '/mobile/map',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>`
  },
  {
    id: 'list', label: '绿道', path: '/mobile/list',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>`
  },
  {
    id: 'favorites', label: '收藏', path: '/mobile/favorites',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`
  },
  {
    id: 'profile', label: '我的', path: '/mobile/profile',
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`
  }
]

const handleTabChange = (tabId) => {
  activeTab.value = tabId
  emit('update:modelValue', tabId)
  emit('change', tabId)
  const item = navItems.find(i => i.id === tabId)
  if (item?.path) router.push(item.path)
}

watch(() => props.modelValue, v => { activeTab.value = v })
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--color-surface);
  border-top: 0.5px solid var(--color-border);
  /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
}

/* 解决毛玻璃时的背景透明问题 */
.theme-light .bottom-nav {
  background: rgba(255, 255, 255, 0.85);
}
.theme-dark .bottom-nav {
  background: rgba(28, 28, 30, 0.85);
}

.nav-inner {
  display: flex;
  height: 56px;
  padding: 0 4px;
}

.nav-tab {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  padding: 6px 4px;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
  -webkit-user-select: none;
  user-select: none;
}

.nav-tab:active { transform: scale(0.93); }

.nav-tab.active {
  color: var(--color-primary);
}

/* 活跃胶囊背景 */
.tab-pill {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 52px;
  height: 32px;
  border-radius: 16px;
  background: var(--fill-primary);
  pointer-events: none;
}

.tab-icon {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.tab-label {
  position: relative;
  z-index: 1;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  letter-spacing: 0.2px;
}

.safe-fill {
  height: env(safe-area-inset-bottom, 0px);
}
</style>
