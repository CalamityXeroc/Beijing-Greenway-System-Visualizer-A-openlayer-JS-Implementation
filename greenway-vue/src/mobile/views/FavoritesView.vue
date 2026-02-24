<template>
  <div class="page">
    <!-- 顶部栏 -->
    <div class="page-header">
      <h1 class="page-title">收藏</h1>
      <span v-if="favorites.length" class="count-badge">{{ favorites.length }}</span>
    </div>

    <!-- 列表 -->
    <div class="scroll-area" v-if="favorites.length">
      <div class="card-list">
        <TrailCard v-for="trail in favorites" :key="trail.id" :trail="trail"
          :is-favorite-prop="true" @click="viewDetail" @toggle-favorite="removeFav" />
      </div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <h2>还没有收藏</h2>
      <p>在绿道列表中点击收藏按钮</p>
      <button class="btn-primary" @click="$router.push('/mobile/list')">浏览绿道</button>
    </div>

    <MobileBottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TrailCard from '../components/TrailCard.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'

const router = useRouter()
const activeTab = ref('favorites')

const favorites = ref([
  { id: 1, name: '温榆河绿道', description: '全长12.5km的滨河景观绿道，风景优美', color: '2E7D32', image: null, difficulty: 'medium', length: 12.5, duration: '3-4小时', distance: 5.2, tags: ['滨河', '长距离'] }
])

const viewDetail = (trail) => router.push(`/mobile/detail/${trail.id}`)
const removeFav = ({ trail, isFavorite }) => {
  if (!isFavorite) favorites.value = favorites.value.filter(t => t.id !== trail.id)
}
</script>

<style scoped>
.page { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--color-bg); }
.page-header {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: 10px;
  padding: max(14px, var(--safe-top)) 16px 12px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.page-title { font-size: var(--text-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.count-badge { background: var(--color-primary); color: #fff; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
.scroll-area { flex: 1; overflow-y: auto; }
.card-list { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
.nav-spacer { height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom,0px) + 12px); }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px; color: var(--color-text-tertiary); text-align: center; }
.empty-state svg { opacity: 0.35; }
.empty-state h2 { font-size: var(--text-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); }
.empty-state p { font-size: var(--text-sm); margin: 0; }
</style>
