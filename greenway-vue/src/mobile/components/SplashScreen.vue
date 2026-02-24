<template>
  <div v-if="!splashFinished" class="splash-screen">
    <!-- 背景纹理噪声层 -->
    <div class="noise-overlay"></div>

    <!-- 中心光晕 -->
    <div class="center-glow"></div>

    <!-- 大型背景装饰叶（左上） -->
    <div class="bg-leaf bg-leaf--tl">
      <svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M150,400 C80,320 20,230 30,130 C42,40 100,8 150,5 C200,8 258,40 270,130 C280,230 220,320 150,400Z"
          fill="rgba(90,190,100,0.06)" />
        <path d="M150,400 L150,5" stroke="rgba(90,190,100,0.08)" stroke-width="1.5"/>
        <path d="M150,340 Q110,290 80,275" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,280 Q100,240 65,220" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,220 Q98,175 60,158" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,160 Q105,115 80,98" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,340 Q190,290 220,275" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,280 Q200,240 235,220" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,220 Q202,175 240,158" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
        <path d="M150,160 Q195,115 220,98" stroke="rgba(90,190,100,0.07)" stroke-width="1"/>
      </svg>
    </div>

    <!-- 大型背景装饰叶（右下） -->
    <div class="bg-leaf bg-leaf--br">
      <svg viewBox="0 0 260 380" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M130,360 C65,285 10,200 20,108 C32,28 88,2 130,0 C172,2 228,28 240,108 C250,200 195,285 130,360Z"
          fill="rgba(120,210,110,0.05)" />
        <path d="M130,360 L130,0" stroke="rgba(120,210,110,0.07)" stroke-width="1.5"/>
        <path d="M130,300 Q92,255 68,238" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
        <path d="M130,240 Q88,200 58,185" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
        <path d="M130,180 Q90,140 65,125" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
        <path d="M130,300 Q168,255 192,238" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
        <path d="M130,240 Q172,200 202,185" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
        <path d="M130,180 Q170,140 195,125" stroke="rgba(120,210,110,0.06)" stroke-width="1"/>
      </svg>
    </div>

    <!-- 漂浮叶片粒子 -->
    <div v-for="leaf in floatingLeaves" :key="leaf.id"
      class="floating-leaf"
      :style="{
        left: leaf.x + '%',
        top: leaf.startY + '%',
        width: leaf.size + 'px',
        height: leaf.size * 1.4 + 'px',
        animationDuration: leaf.dur + 's',
        animationDelay: leaf.delay + 's',
        '--leaf-opacity': leaf.opacity,
        '--rot-start': leaf.rot + 'deg',
        '--rot-end': (leaf.rot + 200) + 'deg'
      }">
      <svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path :d="leaf.shape"
          :fill="leaf.fill"
          :stroke="leaf.stroke"
          stroke-width="0.8"/>
        <line x1="20" y1="54" x2="20" y2="2"
          :stroke="leaf.stroke" stroke-width="0.6" opacity="0.7"/>
        <path d="M20,42 Q13,35 9,32" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
        <path d="M20,30 Q11,23 7,20" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
        <path d="M20,18 Q13,11 11,8" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
        <path d="M20,42 Q27,35 31,32" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
        <path d="M20,30 Q29,23 33,20" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
        <path d="M20,18 Q27,11 29,8" :stroke="leaf.stroke" stroke-width="0.5" opacity="0.5"/>
      </svg>
    </div>

    <!-- 中心内容 -->
    <div class="splash-content">
      <!-- 植物图标 -->
      <div class="splash-logo">
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" fill="none">
          <!-- 外圆环 -->
          <circle cx="60" cy="60" r="54" stroke="rgba(126,217,154,0.3)" stroke-width="0.8" class="ring ring-outer"/>
          <circle cx="60" cy="60" r="46" stroke="rgba(126,217,154,0.15)" stroke-width="0.5" class="ring ring-inner"/>

          <!-- 主叶片 -->
          <path d="M60,100 C38,82 22,62 26,40 C29,24 42,18 60,17 C78,18 91,24 94,40 C98,62 82,82 60,100Z"
            fill="rgba(56,168,80,0.18)" stroke="#6ec887" stroke-width="1.2" class="main-leaf"/>

          <!-- 主脉 -->
          <line x1="60" y1="100" x2="60" y2="17"
            stroke="#7ed99a" stroke-width="1" class="main-vein"/>

          <!-- 左侧叶脉 -->
          <path d="M60,82 Q44,73 36,68" stroke="#7ed99a" stroke-width="0.8" class="vein v1"/>
          <path d="M60,67 Q42,57 33,51" stroke="#7ed99a" stroke-width="0.8" class="vein v2"/>
          <path d="M60,52 Q43,42 35,37" stroke="#7ed99a" stroke-width="0.8" class="vein v3"/>
          <path d="M60,37 Q45,28 41,24" stroke="#7ed99a" stroke-width="0.8" class="vein v4"/>

          <!-- 右侧叶脉 -->
          <path d="M60,82 Q76,73 84,68" stroke="#7ed99a" stroke-width="0.8" class="vein v5"/>
          <path d="M60,67 Q78,57 87,51" stroke="#7ed99a" stroke-width="0.8" class="vein v6"/>
          <path d="M60,52 Q77,42 85,37" stroke="#7ed99a" stroke-width="0.8" class="vein v7"/>
          <path d="M60,37 Q75,28 79,24" stroke="#7ed99a" stroke-width="0.8" class="vein v8"/>

          <!-- 叶芽光点 -->
          <circle cx="60" cy="17" r="2.5" fill="#b2f0c4" class="bud-glow"/>
          <!-- 叶基露珠 -->
          <circle cx="60" cy="100" r="1.8" fill="rgba(178,240,196,0.8)" class="dewdrop"/>

          <!-- 四角装饰小叶 -->
          <path d="M22,22 C18,16 20,10 26,10 C32,10 33,16 29,22 C26,18 22,22Z"
            fill="rgba(110,200,135,0.4)" class="deco-leaf dl1"/>
          <path d="M98,22 C94,16 96,10 102,10 C108,10 108,16 104,22 C100,18 98,22Z"
            fill="rgba(110,200,135,0.4)" class="deco-leaf dl2"/>
          <path d="M22,98 C18,92 20,86 26,86 C32,86 33,92 29,98 C26,94 22,98Z"
            fill="rgba(110,200,135,0.4)" class="deco-leaf dl3"/>
          <path d="M98,98 C94,92 96,86 102,86 C108,86 108,92 104,98 C100,94 98,98Z"
            fill="rgba(110,200,135,0.4)" class="deco-leaf dl4"/>
        </svg>
      </div>

      <!-- 标题和副标题 -->
      <h1 class="splash-title">绿脉伴旅</h1>
      <p class="splash-subtitle">探索北京绿道之美</p>

      <!-- 进度条 -->
      <div class="splash-progress-wrap">
        <div class="splash-progress">
          <div class="splash-progress-bar" :style="{ width: progress + '%' }">
            <span class="progress-glow"></span>
          </div>
        </div>
        <p class="splash-loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['finish'])

const splashFinished = ref(false)
const progress = ref(0)
const loadingText = ref('加载中...')

const loadingMessages = [
  '初始化应用...',
  '加载地图数据...',
  '准备绿道信息...',
  '就绪完毕...'
]

// 叶片形状路径集合
const leafShapes = [
  'M20,54 C10,42 4,28 8,14 C10,6 14,2 20,2 C26,2 30,6 32,14 C36,28 30,42 20,54Z',
  'M20,54 C8,38 6,22 12,10 C15,4 18,1 20,1 C22,1 25,4 28,10 C34,22 32,38 20,54Z',
  'M20,52 C12,40 6,26 10,12 C12,5 16,2 20,2 C24,2 28,5 30,12 C34,26 28,40 20,52Z',
]

// 随机生成漂浮叶片数据
const floatingLeaves = Array.from({ length: 12 }, (_, i) => {
  const shapeIndex = i % leafShapes.length
  const hue = 100 + Math.random() * 60 // 绿色色调
  const lightness = 40 + Math.random() * 30
  return {
    id: i,
    x: Math.random() * 92,
    startY: 5 + Math.random() * 95,
    size: 14 + Math.random() * 22,
    dur: 14 + Math.random() * 22,
    delay: -(Math.random() * 20),
    opacity: (0.12 + Math.random() * 0.2).toFixed(2),
    rot: Math.floor(Math.random() * 360),
    shape: leafShapes[shapeIndex],
    fill: `hsla(${hue}, 60%, ${lightness}%, 0.3)`,
    stroke: `hsla(${hue}, 65%, ${lightness + 20}%, 0.7)`,
  }
})

onMounted(async () => {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 0 })
  } catch (e) {
    // Web 环境无 Capacitor，忽略
  }

  const interval = setInterval(() => {
    progress.value += Math.random() * 30
    if (progress.value > 90) progress.value = 90
    const idx = Math.floor((progress.value / 100) * loadingMessages.length)
    loadingText.value = loadingMessages[Math.min(idx, loadingMessages.length - 1)]
  }, 300)

  setTimeout(() => {
    clearInterval(interval)
    progress.value = 100
    loadingText.value = '进入应用...'
    setTimeout(() => {
      splashFinished.value = true
      emit('finish')
    }, 600)
  }, props.duration)
})
</script>

<style scoped>
/* ============================
   基础布局
   ============================ */
.splash-screen {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 50% 38%,
    #1e6b32 0%,
    #134523 50%,
    #0a2a14 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 9999);
  overflow: hidden;
  animation: screenFadeIn 0.8s ease-out both;
}

@keyframes screenFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* 噪声纹理叠加层 */
.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
}

/* 中心光晕 */
.center-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -58%);
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(74, 178, 97, 0.18) 0%,
    rgba(40, 104, 54, 0.1) 40%,
    transparent 70%);
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: translate(-50%, -58%) scale(1);   opacity: 0.9; }
  50%       { transform: translate(-50%, -58%) scale(1.12); opacity: 1;   }
}

/* ============================
   大型背景装饰叶
   ============================ */
.bg-leaf {
  position: absolute;
  pointer-events: none;
}

.bg-leaf--tl {
  top: -80px;
  left: -60px;
  width: 260px;
  height: 360px;
  transform-origin: 70% 80%;
  animation: bgLeafSway 18s ease-in-out infinite;
}

.bg-leaf--br {
  bottom: -70px;
  right: -50px;
  width: 220px;
  height: 310px;
  transform-origin: 30% 20%;
  animation: bgLeafSway 22s ease-in-out infinite reverse;
  animation-delay: -6s;
}

@keyframes bgLeafSway {
  0%, 100% { transform: rotate(0deg)   scale(1);    }
  25%       { transform: rotate(3deg)  scale(1.02); }
  75%       { transform: rotate(-2.5deg) scale(0.98); }
}

/* ============================
   漂浮叶片粒子
   ============================ */
.floating-leaf {
  position: absolute;
  pointer-events: none;
  animation: leafFloat linear infinite;
  will-change: transform, opacity;
  filter: blur(0.4px);
}

@keyframes leafFloat {
  0% {
    transform: translateY(0px) translateX(0px) rotate(var(--rot-start, 0deg));
    opacity: 0;
  }
  8%  { opacity: var(--leaf-opacity, 0.2); }
  85% { opacity: var(--leaf-opacity, 0.2); }
  100% {
    transform: translateY(-110vh) translateX(35px) rotate(var(--rot-end, 200deg));
    opacity: 0;
  }
}

/* ============================
   中心内容区
   ============================ */
.splash-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 280px;
}

/* ============================
   植物 Logo
   ============================ */
.splash-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 28px;
  animation: logoEntry 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  filter: drop-shadow(0 0 18px rgba(110, 200, 135, 0.35))
          drop-shadow(0 6px 16px rgba(0,0,0,0.5));
}

@keyframes logoEntry {
  from { transform: scale(0.5) translateY(-20px); opacity: 0; }
  to   { transform: scale(1)   translateY(0);     opacity: 1; }
}

/* 圆环旋转 */
.ring {
  stroke-dasharray: 4 8;
  transform-origin: 60px 60px;
}
.ring-outer { animation: ringRotate 40s linear infinite; }
.ring-inner { animation: ringRotate 28s linear infinite reverse; }

@keyframes ringRotate {
  to { transform: rotate(360deg); }
}

/* 主叶片描边动画 */
.main-leaf {
  stroke-dasharray: 260;
  stroke-dashoffset: 260;
  animation: drawLeaf 1.4s ease-out 0.6s forwards;
}
@keyframes drawLeaf {
  to { stroke-dashoffset: 0; }
}

/* 主脉 */
.main-vein {
  stroke-dasharray: 85;
  stroke-dashoffset: 85;
  animation: drawLeaf 1s ease-out 1.2s forwards;
}

/* 各叶脉依次绘出 */
.vein { stroke-dasharray: 30; stroke-dashoffset: 30; }
.v1 { animation: drawLeaf 0.5s ease-out 1.8s forwards; }
.v5 { animation: drawLeaf 0.5s ease-out 1.9s forwards; }
.v2 { animation: drawLeaf 0.5s ease-out 2.0s forwards; }
.v6 { animation: drawLeaf 0.5s ease-out 2.1s forwards; }
.v3 { animation: drawLeaf 0.5s ease-out 2.2s forwards; }
.v7 { animation: drawLeaf 0.5s ease-out 2.3s forwards; }
.v4 { animation: drawLeaf 0.5s ease-out 2.4s forwards; }
.v8 { animation: drawLeaf 0.5s ease-out 2.5s forwards; }

/* 芽点脉冲 */
.bud-glow {
  animation: budPulse 2.4s ease-in-out 2.6s infinite;
  filter: blur(0.5px);
}
@keyframes budPulse {
  0%, 100% { r: 2.5; opacity: 1;   fill: #b2f0c4; }
  50%       { r: 4;   opacity: 0.6; fill: #e0ffe8; }
}

/* 露珠 */
.dewdrop {
  animation: dewdrop 3s ease-in-out 2s infinite;
}
@keyframes dewdrop {
  0%, 100% { opacity: 0.8; transform: scale(1);    }
  50%       { opacity: 0.3; transform: scale(0.6);  }
}

/* 角落小叶 */
.deco-leaf {
  transform-origin: center;
  animation: decoLeafPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.dl1 { animation-delay: 2.7s; }
.dl2 { animation-delay: 2.9s; }
.dl3 { animation-delay: 3.1s; }
.dl4 { animation-delay: 3.3s; }
@keyframes decoLeafPop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ============================
   文字
   ============================ */
.splash-title {
  font-size: 34px;
  font-weight: 700;
  color: #e8f8ec;
  text-align: center;
  margin: 0 0 8px 0;
  letter-spacing: 6px;
  text-shadow: 0 0 24px rgba(100,220,130,0.4), 0 2px 8px rgba(0,0,0,0.6);
  animation: textRise 0.9s ease-out 0.5s both;
}

.splash-subtitle {
  font-size: 13px;
  color: rgba(180, 235, 195, 0.75);
  text-align: center;
  margin: 0 0 36px 0;
  letter-spacing: 3px;
  font-weight: 300;
  animation: textRise 0.9s ease-out 0.8s both;
}

@keyframes textRise {
  from { opacity: 0; transform: translateY(14px); letter-spacing: 8px; }
  to   { opacity: 1; transform: translateY(0);    }
}

/* ============================
   进度条
   ============================ */
.splash-progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: textRise 0.9s ease-out 1.1s both;
}

.splash-progress {
  width: 180px;
  height: 2px;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  overflow: visible;
  position: relative;
}

.splash-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3dba5e, #7ed99a);
  border-radius: 999px;
  transition: width 0.35s ease-out;
  position: relative;
  box-shadow: 0 0 8px rgba(100, 220, 140, 0.6);
}

/* 进度条前端光点 */
.progress-glow {
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #b2f0c4;
  box-shadow: 0 0 8px 3px rgba(178, 240, 196, 0.7);
  animation: glowFade 0.8s ease-in-out infinite alternate;
}

@keyframes glowFade {
  from { opacity: 0.7; transform: translateY(-50%) scale(0.9); }
  to   { opacity: 1;   transform: translateY(-50%) scale(1.2); }
}

.splash-loading-text {
  font-size: 11px;
  color: rgba(180, 235, 195, 0.5);
  letter-spacing: 1.5px;
  text-align: center;
  font-weight: 300;
  min-height: 16px;
}
</style>
