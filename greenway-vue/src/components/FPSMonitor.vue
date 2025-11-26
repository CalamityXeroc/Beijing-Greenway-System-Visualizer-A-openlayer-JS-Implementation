<template>
  <div v-if="show" class="fps-monitor" :class="{ warning: fps < 30, danger: fps < 20 }">
    <div class="fps-display">
      <i class="fas fa-tachometer-alt"></i>
      <span class="fps-value">{{ fps }}</span>
      <span class="fps-label">FPS</span>
    </div>
    <div class="performance-tips" v-if="fps < 30">
      <i class="fas fa-exclamation-triangle"></i>
      <span>性能较低,建议关闭部分图层</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { FPSMonitor } from '@/utils/performance'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const fps = ref(60)
let fpsMonitor = null

onMounted(() => {
  fpsMonitor = new FPSMonitor()
  fpsMonitor.start((currentFPS) => {
    fps.value = currentFPS
  })
})

onBeforeUnmount(() => {
  if (fpsMonitor) {
    fpsMonitor.stop()
  }
})
</script>

<style scoped>
.fps-monitor {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 10px 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  transform: translateZ(0);
}

.fps-monitor.warning {
  background: rgba(255, 165, 0, 0.9);
  color: #fff;
}

.fps-monitor.danger {
  background: rgba(255, 0, 0, 0.9);
  color: #fff;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fps-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.fps-value {
  font-size: 24px;
  min-width: 40px;
  text-align: center;
}

.fps-label {
  font-size: 12px;
  opacity: 0.8;
}

.performance-tips {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.performance-tips i {
  animation: warning-blink 1s infinite;
}

@keyframes warning-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
