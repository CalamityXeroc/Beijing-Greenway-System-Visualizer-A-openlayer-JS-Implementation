<template>
  <div class="trail-card" @click="handleClick">
    <div class="card-thumb">
      <img :src="imgSrc" :alt="trail.name" class="thumb-img" @error="onImgError" />
      <span v-if="trail.difficulty" class="diff-badge" :class="'diff-' + trail.difficulty">{{ diffText }}</span>
    </div>
    <div class="card-body">
      <h3 class="trail-name">{{ trail.name }}</h3>
      <p v-if="cleanDesc" class="trail-desc line-clamp-2">{{ cleanDesc }}</p>
      <div class="card-meta">
        <!-- 距离标签（有定位时显示） -->
        <span v-if="distanceText" class="meta-dist">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {{ distanceText }}
        </span>
        <span v-if="trail.length" class="meta-chip">· {{ trail.length }}km</span>
        <span v-if="trail.duration" class="meta-chip">{{ trail.duration }}</span>
        <span v-if="trail.tags && trail.tags[0]" class="meta-tag">{{ trail.tags[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDistance } from '../composables/useLocation'

const props = defineProps({
  trail: { type: Object, required: true },
  distanceKm: { type: Number, default: null }
})
const emit = defineEmits(['click', 'toggle-favorite'])

const diffText = computed(() => ({ easy: '简单', medium: '中等', hard: '困难' })[props.trail.difficulty] ?? '')

const distanceText = computed(() => {
  if (props.distanceKm == null) return ''
  return '距您 ' + formatDistance(props.distanceKm)
})

// 清洗描述文本：移除乱码字符、控制字符、多余空白
const cleanDesc = computed(() => {
  const raw = props.trail.description || ''
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')   // 控制字符
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')                   // 替换符号
    .replace(/[^\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef\u0020-\u007Ea-zA-Z0-9\s\.,\uff0c\u3002\uff01\uff1f]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
})

const imgSrc = computed(() => {
  if (!props.trail.image) {
    const hex = (props.trail.color || '2E7D32').replace('#', '')
    return `https://dummyimage.com/300x180/${hex}/ffffff&text=${encodeURIComponent(props.trail.name || '')}`
  }
  return props.trail.image
})

const handleClick = () => emit('click', props.trail)
const onImgError = (e) => {
  const hex = (props.trail.color || '2E7D32').replace('#', '')
  e.target.src = `https://dummyimage.com/300x180/${hex}/ffffff&text=${encodeURIComponent(props.trail.name || '绿道')}`
}
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
  padding: 2px 7px; border-radius: 4px;
  font-size: 10px; font-weight: 600; color: #fff;
}
.diff-easy   { background: #34c759; }
.diff-medium { background: #ff9f0a; }
.diff-hard   { background: #ff3b30; }

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
.meta-dist {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px;
  background: rgba(0,122,255,0.1);
  color: #007aff;
  border-radius: var(--radius-full);
  font-size: 11px; font-weight: var(--font-weight-semibold);
}
</style>