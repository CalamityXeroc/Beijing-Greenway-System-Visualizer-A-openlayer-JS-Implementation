<template>
  <div class="trail-card" @click="handleClick">
    <div class="card-thumb">
      <img :src="imgSrc" :alt="trail.name" class="thumb-img" @error="onImgError" />
      <span v-if="trail.difficulty" class="diff-badge" :class="'diff-' + trail.difficulty">{{ diffText }}</span>
      <button class="fav-btn" :class="{ active: isFav }" @click.stop="toggleFav" aria-label="收藏">
        <svg viewBox="0 0 24 24" width="16" height="16" :fill="isFav ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    <div class="card-body">
      <h3 class="trail-name">{{ trail.name }}</h3>
      <p v-if="trail.description" class="trail-desc line-clamp-2">{{ trail.description }}</p>
      <div class="card-meta">
        <span v-if="trail.length" class="meta-chip">{{ trail.length }}km</span>
        <span v-if="trail.duration" class="meta-chip">{{ trail.duration }}</span>
        <span v-if="trail.tags && trail.tags[0]" class="meta-tag">{{ trail.tags[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  trail: { type: Object, required: true },
  isFavoriteProp: { type: Boolean, default: false }
})
const emit = defineEmits(['click', 'toggle-favorite'])

const isFav = ref(props.isFavoriteProp)
const imgError = ref(false)

const diffText = computed(() => ({ easy: '简单', medium: '中等', hard: '困难' })[props.trail.difficulty] ?? '')

const imgSrc = computed(() => {
  if (imgError.value || !props.trail.image) {
    const hex = (props.trail.color || '2E7D32').replace('#', '')
    return `https://dummyimage.com/300x180/${hex}/ffffff&text=${encodeURIComponent(props.trail.name || '')}`
  }
  return props.trail.image
})

const onImgError = () => { imgError.value = true }
const handleClick = () => emit('click', props.trail)
const toggleFav = () => { isFav.value = !isFav.value; emit('toggle-favorite', { trail: props.trail, isFavorite: isFav.value }) }
</script>

<style scoped>
.trail-card {
  display: flex; gap: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 12px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  -webkit-user-select: none; user-select: none;
}
.trail-card:active { transform: scale(0.975); box-shadow: none; }

.card-thumb {
  position: relative; flex: 0 0 96px; height: 96px;
  border-radius: var(--radius-md); overflow: hidden;
  background: var(--color-surface-3);
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; }

.diff-badge {
  position: absolute; bottom: 5px; left: 5px;
  padding: 2px 6px; border-radius: 4px;
  font-size: 10px; font-weight: 600; color: #fff;
}
.diff-easy { background: #34c759; }
.diff-medium { background: #ff9f0a; }
.diff-hard { background: #ff3b30; }

.fav-btn {
  position: absolute; top: 5px; right: 5px;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.35); color: rgba(255,255,255,0.85);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background var(--transition-fast);
}
.fav-btn.active { background: rgba(255,59,48,0.85); color: #fff; }
.fav-btn:active { transform: scale(0.88); }

.card-body {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 4px; padding: 2px 0;
}
.trail-name {
  font-size: var(--text-base); font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary); line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.trail-desc {
  font-size: var(--text-sm); color: var(--color-text-secondary);
  line-height: 1.45; flex: 1;
}
.card-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 7px; background: var(--color-surface-2);
  border-radius: var(--radius-full); font-size: 11px;
  color: var(--color-text-secondary); font-weight: var(--font-weight-medium);
}
.meta-tag {
  padding: 3px 7px; background: var(--fill-primary);
  color: var(--color-primary); border-radius: var(--radius-full);
  font-size: 11px; font-weight: var(--font-weight-medium);
}
</style>
