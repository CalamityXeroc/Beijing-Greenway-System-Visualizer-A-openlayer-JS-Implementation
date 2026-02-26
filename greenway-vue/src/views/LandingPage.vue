<template>
  <div class="fp-root">
    <!-- 粒子背景 Canvas（固定层） -->
    <canvas ref="canvasRef" class="bg-canvas"></canvas>

    <!-- 几何装饰（固定层） -->
    <div class="geo-decor" aria-hidden="true">
      <div class="geo-ring geo-ring--1"></div>
      <div class="geo-ring geo-ring--2"></div>
      <div class="geo-ring geo-ring--3"></div>
    </div>

    <!-- ══════════ 固定顶部导航 ══════════ -->
    <header class="lp-header" :class="{ scrolled: currentPage > 0 }">
      <div class="lp-header__inner">
        <div class="lp-logo">
          <div class="lp-logo__icon">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#1B5E20" opacity="0.3"/>
              <path d="M20 6 C12 12 8 18 8 24 C8 30 13.5 34 20 34 C26.5 34 32 30 32 24 C32 18 28 12 20 6Z" fill="#2E7D32" opacity="0.85"/>
              <path d="M20 9 L20 32 M13 22 C16 18 20 17 25 18.5" stroke="#A5D6A7" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="20" cy="22" r="2.5" fill="#69F0AE" opacity="0.9"/>
            </svg>
          </div>
          <span class="lp-logo__text">北京绿道系统</span>
        </div>

        <nav class="lp-nav">
          <a @click.prevent="goTo(0)" :class="{ active: currentPage === 0 }" class="lp-nav__link" href="#">首页</a>
          <a @click.prevent="goTo(1)" :class="{ active: currentPage === 1 }" class="lp-nav__link" href="#">数据概览</a>
          <a @click.prevent="goTo(2)" :class="{ active: currentPage === 2 }" class="lp-nav__link" href="#">平台简介</a>
          <a @click.prevent="goTo(3)" :class="{ active: currentPage === 3 }" class="lp-nav__link" href="#">精选绿道</a>
          <a @click.prevent="goTo(4)" :class="{ active: currentPage === 4 }" class="lp-nav__link" href="#">核心功能</a>
        </nav>

        <div class="lp-header__actions">
          <a href="/login" class="btn-ghost">登录</a>
          <a href="/map" class="btn-primary">进入地图</a>
        </div>
      </div>
    </header>

    <!-- ══════════ 右侧页面指示点 ══════════ -->
    <nav class="side-dots" aria-label="页面导航">
      <button
        v-for="(label, i) in pageLabels"
        :key="i"
        class="side-dot"
        :class="{ active: currentPage === i }"
        @click="goTo(i)"
        :aria-label="label"
      >
        <span class="dot-tip">{{ label }}</span>
      </button>
    </nav>

    <!-- ══════════ 全屏分页滑动容器 ══════════ -->
    <div class="fp-container">
      <div
        class="fp-slider"
        :style="{ transform: `translateY(-${currentPage * 100}vh)` }"
      >

        <!-- ────── Page 0: Hero ────── -->
        <section class="fp-section fp-hero">
          <div class="hero-inner">
            <div class="hero__content">
              <div class="hero__badge">
                <span class="badge-dot"></span>
                北京市绿道信息化管理平台
              </div>
              <h1 class="hero__title">
                <span class="line1">探索北京</span>
                <span class="line2">绿色廊道</span>
              </h1>
              <p class="hero__desc">
                汇聚北京 12 条精品绿道，串联山、水、林、田生态空间<br>
                打造全市贯通的绿色休闲游憩网络，助力城市生态可持续发展
              </p>
              <div class="hero__cta">
                <a href="/map" class="cta-primary">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  立即探索地图
                </a>
                <button @click="goTo(1)" class="cta-secondary">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  了解平台
                </button>
              </div>
            </div>

            <div class="hero__visual">
              <div class="globe-wrap">
                <svg class="globe-svg" viewBox="0 0 400 400" fill="none">
                  <circle cx="200" cy="200" r="185" fill="none" stroke="url(#globeGlow)" stroke-width="1.5" opacity="0.5"/>
                  <circle cx="200" cy="200" r="160" fill="url(#globeFill)" stroke="rgba(105,240,174,0.3)" stroke-width="1"/>
                  <ellipse cx="200" cy="200" rx="160" ry="55" fill="none" stroke="rgba(165,214,167,0.2)" stroke-width="0.8"/>
                  <ellipse cx="200" cy="200" rx="160" ry="110" fill="none" stroke="rgba(165,214,167,0.15)" stroke-width="0.8"/>
                  <line x1="200" y1="40" x2="200" y2="360" stroke="rgba(165,214,167,0.2)" stroke-width="0.8"/>
                  <line x1="40" y1="200" x2="360" y2="200" stroke="rgba(165,214,167,0.15)" stroke-width="0.8"/>
                  <ellipse cx="200" cy="200" rx="55" ry="160" fill="none" stroke="rgba(165,214,167,0.15)" stroke-width="0.8"/>
                  <ellipse cx="200" cy="200" rx="110" ry="160" fill="none" stroke="rgba(165,214,167,0.1)" stroke-width="0.8"/>
                  <path d="M130 240 Q170 180 210 200 Q250 220 280 170" stroke="#69F0AE" stroke-width="2.5" stroke-linecap="round" opacity="0.8" class="globe-path"/>
                  <path d="M120 200 Q160 230 200 210 Q240 190 270 220" stroke="#A5D6A7" stroke-width="1.5" stroke-linecap="round" opacity="0.6" stroke-dasharray="4 3"/>
                  <circle cx="130" cy="240" r="4" fill="#69F0AE" opacity="0.9"/>
                  <circle cx="210" cy="200" r="5" fill="#00E676" opacity="0.9" class="pulse-dot"/>
                  <circle cx="280" cy="170" r="4" fill="#69F0AE" opacity="0.9"/>
                  <circle cx="200" cy="210" r="3" fill="#A5D6A7" opacity="0.7"/>
                  <circle cx="200" cy="200" r="8" fill="none" stroke="#00E676" stroke-width="1.5" opacity="0.5" class="city-ring"/>
                  <circle cx="200" cy="200" r="4" fill="#00E676" opacity="0.9"/>
                  <defs>
                    <radialGradient id="globeFill" cx="40%" cy="35%">
                      <stop offset="0%" stop-color="#1a3a2a"/>
                      <stop offset="60%" stop-color="#0d2018"/>
                      <stop offset="100%" stop-color="#061410"/>
                    </radialGradient>
                    <radialGradient id="globeGlow" cx="50%" cy="50%">
                      <stop offset="0%" stop-color="#69F0AE" stop-opacity="0.6"/>
                      <stop offset="100%" stop-color="#69F0AE" stop-opacity="0"/>
                    </radialGradient>
                  </defs>
                </svg>
                <div class="orbit orbit--1"><div class="orbit__dot"></div></div>
                <div class="orbit orbit--2"><div class="orbit__dot orbit__dot--2"></div></div>
              </div>
            </div>
          </div>

          <!-- 向下滚动提示 -->
          <div class="scroll-hint" @click="goTo(1)">
            <div class="scroll-hint__mouse">
              <div class="scroll-hint__wheel"></div>
            </div>
            <span>向下滚动</span>
          </div>
        </section>

        <!-- ────── Page 1: Stats ────── -->
        <section class="fp-section fp-stats">
          <div class="page-inner">
            <div class="section-heading">
              <div class="section-tag">DATA</div>
              <h2 class="section-title">数据一览</h2>
              <p class="section-desc">北京绿道系统核心数据指标</p>
            </div>
            <div class="stats-grid">
              <div
                v-for="stat in statsData"
                :key="stat.label"
                class="stat-card"
                :class="{ visible: currentPage >= 1 }"
              >
                <div class="stat-card__icon" :style="{ background: stat.gradient }">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="stat.icon"/>
                </div>
                <div class="stat-card__num">
                  <span class="counter">{{ currentPage >= 1 ? stat.display : '0' }}</span>
                  <span class="stat-unit">{{ stat.unit }}</span>
                </div>
                <div class="stat-card__label">{{ stat.label }}</div>
                <div class="stat-card__sub">{{ stat.sub }}</div>
              </div>
            </div>
            <div class="type-bar">
              <div v-for="t in gwTypes" :key="t.name" class="type-item">
                <div class="type-dot" :style="{ background: t.color }"></div>
                <span>{{ t.name }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ────── Page 2: About ────── -->
        <section class="fp-section fp-about">
          <div class="page-inner">
            <div class="section-heading">
              <div class="section-tag">ABOUT</div>
              <h2 class="section-title">关于平台</h2>
              <p class="section-desc">北京绿道信息化管理平台简介</p>
            </div>
            <div class="about-grid">
              <div class="about-main">
                <p class="about-text">
                  北京绿道系统信息化平台整合了全市主要绿道的空间数据、属性信息与游憩资源，
                  依托 <strong>WebGIS 技术</strong>实现绿道路网的可视化展示与交互式查询，
                  为市民、游客和规划管理部门提供精准的绿道信息服务。
                  平台覆盖<strong>东城、西城、朝阳、海淀、昌平、通州</strong>等多区，
                  总里程超过 <strong>440 公里</strong>。
                </p>
                <div class="about-tags">
                  <span class="atag" v-for="t in aboutTags" :key="t">{{ t }}</span>
                </div>
              </div>
              <div class="about-cards">
                <div class="about-mini-card" v-for="card in aboutCards" :key="card.title">
                  <div class="amc-icon" :style="{ color: card.color }">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="card.icon"/>
                  </div>
                  <div>
                    <div class="amc-title">{{ card.title }}</div>
                    <div class="amc-desc">{{ card.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ────── Page 3: Greenways ────── -->
        <section class="fp-section fp-greenways">
          <div class="page-inner">
            <div class="section-heading">
              <div class="section-tag">GREENWAYS</div>
              <h2 class="section-title">精选绿道路线</h2>
              <p class="section-desc">12 条精品绿道，等待您亲身探索</p>
            </div>
            <div class="gw-grid">
              <a v-for="gw in greenwayCards" :key="gw.id" :href="gw.path" class="gw-card">
                <div class="gw-card__top">
                  <div class="gw-tag" :style="{ background: gw.tagBg }">{{ gw.type }}</div>
                  <div class="gw-len">{{ gw.length }}km</div>
                </div>
                <div class="gw-card__body">
                  <h3 class="gw-name">{{ gw.name }}</h3>
                  <p class="gw-desc">{{ gw.desc }}</p>
                </div>
                <div class="gw-card__foot">
                  <span class="gw-area">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ gw.area }}
                  </span>
                  <span class="gw-arrow">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                </div>
                <div class="gw-card__bar" :style="{ background: gw.barColor }"></div>
              </a>
            </div>
            <div class="gw-cta">
              <a href="/map" class="btn-primary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                在地图中查看全部 12 条绿道
              </a>
            </div>
          </div>
        </section>

        <!-- ────── Page 4: Features ────── -->
        <section class="fp-section fp-features">
          <div class="page-inner">
            <div class="section-heading">
              <div class="section-tag">FEATURES</div>
              <h2 class="section-title">平台核心功能</h2>
              <p class="section-desc">多维度绿道信息服务，科技赋能生态城市建设</p>
            </div>
            <div class="feat-grid">
              <div class="feat-card" v-for="feat in features" :key="feat.title">
                <div class="feat-icon" :style="{ '--fc': feat.color }">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" v-html="feat.icon"/>
                </div>
                <h3 class="feat-title">{{ feat.title }}</h3>
                <p class="feat-desc">{{ feat.desc }}</p>
                <div class="feat-glow" :style="{ background: feat.color }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- ────── Page 5: CTA + Footer ────── -->
        <section class="fp-section fp-final">
          <div class="final-inner">
            <div class="banner-card">
              <div class="banner-text">
                <h2>准备好探索北京的<br>绿色脉络了吗？</h2>
                <p>无需注册，立即进入地图，发现身边的绿道之美</p>
              </div>
              <div class="banner-actions">
                <a href="/map" class="btn-primary btn-lg">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  进入地图
                </a>
                <a href="/register" class="btn-ghost btn-lg">注册账号</a>
              </div>
            </div>

            <footer class="lp-footer">
              <div class="footer-inner">
                <div class="footer-brand">
                  <div class="lp-logo">
                    <div class="lp-logo__icon" style="width:30px;height:30px">
                      <svg viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="#1B5E20" opacity="0.3"/>
                        <path d="M20 6 C12 12 8 18 8 24 C8 30 13.5 34 20 34 C26.5 34 32 30 32 24 C32 18 28 12 20 6Z" fill="#2E7D32" opacity="0.85"/>
                        <path d="M20 9 L20 32 M13 22 C16 18 20 17 25 18.5" stroke="#A5D6A7" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <span class="lp-logo__text" style="font-size:0.88rem">北京绿道系统</span>
                  </div>
                  <p class="footer-slogan">串联山水 · 绿色出行 · 生态北京</p>
                </div>
                <div class="footer-links">
                  <div class="fl-group">
                    <div class="fl-title">功能入口</div>
                    <a href="/map" class="fl-link">绿道地图</a>
                    <a href="/login" class="fl-link">用户登录</a>
                    <a href="/register" class="fl-link">注册账号</a>
                  </div>
                  <div class="fl-group">
                    <div class="fl-title">精选绿道</div>
                    <a href="/wenyu" class="fl-link">温榆河绿道</a>
                    <a href="/huanerhuan" class="fl-link">环二环绿道</a>
                    <a href="/sanshan" class="fl-link">三山五园绿道</a>
                    <a href="/aosen" class="fl-link">奥林匹克绿道</a>
                  </div>
                  <div class="fl-group">
                    <div class="fl-title">技术信息</div>
                    <span class="fl-link">Vue 3 + Vite</span>
                    <span class="fl-link">OpenLayers WebGIS</span>
                    <span class="fl-link">Node.js + PostgreSQL</span>
                  </div>
                </div>
              </div>
              <div class="footer-bottom">
                <span>© 2025 北京绿道系统信息化平台 · 保留所有权利</span>
                <span class="footer-sep">·</span>
                <span>数据仅供参考，请以官方发布为准</span>
              </div>
            </footer>
          </div>
        </section>

      </div><!-- /fp-slider -->
    </div><!-- /fp-container -->
  </div><!-- /fp-root -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ══════════════════════════════════════════════════
// 全屏分页控制
// ══════════════════════════════════════════════════
const TOTAL_PAGES = 6
const currentPage = ref(0)
let isAnimating = false

function goTo(index) {
  if (isAnimating) return
  const target = Math.max(0, Math.min(TOTAL_PAGES - 1, index))
  if (target === currentPage.value) return
  isAnimating = true
  currentPage.value = target
  // 与 CSS transition 时长 (0.9s) 对应，留少量余量
  setTimeout(() => { isAnimating = false }, 950)
}

// 鼠标滚轮 —— { passive: false } 才能 preventDefault
function onWheel(e) {
  e.preventDefault()
  if (isAnimating) return
  if (e.deltaY > 0) goTo(currentPage.value + 1)
  else             goTo(currentPage.value - 1)
}

// 键盘方向键 / PageUp / PageDown
function onKeyDown(e) {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentPage.value + 1) }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(currentPage.value - 1) }
}

// 移动端触摸滑动
let touchStartY = 0
function onTouchStart(e) { touchStartY = e.touches[0].clientY }
function onTouchEnd(e) {
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dy) < 50) return
  dy > 0 ? goTo(currentPage.value + 1) : goTo(currentPage.value - 1)
}

// 右侧指示点标签
const pageLabels = ['首页', '数据', '简介', '绿道', '功能', '联系']

// ══════════════════════════════════════════════════
// 数据
// ══════════════════════════════════════════════════
const statsData = [
  {
    label: '绿道总数', display: '12', unit: '条',
    sub: '覆盖北京各主要功能区',
    gradient: 'linear-gradient(135deg,#1B5E20,#2E7D32)',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
  },
  {
    label: '覆盖总里程', display: '440+', unit: 'km',
    sub: '贯通全市绿色廊道',
    gradient: 'linear-gradient(135deg,#004D40,#00695C)',
    icon: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>'
  },
  {
    label: '连接景点', display: '300+', unit: '处',
    sub: '历史文化 · 生态节点',
    gradient: 'linear-gradient(135deg,#1A237E,#283593)',
    icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  },
  {
    label: '覆盖行政区', display: '7+', unit: '个区',
    sub: '东西朝海丰昌通',
    gradient: 'linear-gradient(135deg,#4A148C,#6A1B9A)',
    icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'
  }
]

const gwTypes = [
  { name: '滨水型', color: '#1565C0' }, { name: '城市型', color: '#2E7D32' },
  { name: '历史文化', color: '#6A1B9A' }, { name: '山地型', color: '#33691E' },
  { name: '运动型', color: '#B71C1C' }, { name: '生态郊野', color: '#388E3C' }
]

const aboutTags = ['WebGIS · OpenLayers', 'Vue 3 + Vite', 'PostGIS 空间数据库', '绿道可视化', '多端适配', '节点查询', '互动地图', '生态信息服务']

const aboutCards = [
  { title: '空间数据可视化', desc: 'GeoJSON 矢量数据精准呈现绿道路线走向', color: '#69F0AE', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
  { title: '多图层叠加', desc: '北京市界、行政区划与绿道图层自由切换', color: '#40C4FF', icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
  { title: '绿道属性查询', desc: '点击路线即显示长度、区域、景点等详细信息', color: '#FFD740', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { title: '多端兼容', desc: '桌面端与移动端完整适配，随时随地查阅', color: '#FF6E40', icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' }
]

const greenwayCards = [
  { id: 1,  name: '温榆河绿道',     type: '滨水型',   length: 108,  area: '昌平·顺义·朝阳·通州', desc: '北京最长滨水绿道，四区贯通',         path: '/wenyu',       tagBg: 'rgba(0,105,192,0.3)',   barColor: '#1565C0' },
  { id: 2,  name: '环二环城市绿道', type: '城市型',   length: 87,   area: '东城·西城·朝阳·海淀',  desc: '环绕城市核心，胡同文化与现代都市',   path: '/huanerhuan',  tagBg: 'rgba(46,125,50,0.3)',   barColor: '#2E7D32' },
  { id: 3,  name: '三山五园绿道',   type: '历史文化', length: 36,   area: '海淀区',               desc: '连接颐和园、圆明园等皇家园林',       path: '/sanshan',     tagBg: 'rgba(106,27,154,0.3)', barColor: '#6A1B9A' },
  { id: 4,  name: '奥林匹克绿道',   type: '主题型',   length: 23,   area: '朝阳区奥森',           desc: '双奥之城的体育精神绿道',             path: '/aosen',       tagBg: 'rgba(230,81,0,0.3)',    barColor: '#E65100' },
  { id: 5,  name: '北运河绿道',     type: '运河文化', length: 36,   area: '通州区',               desc: '大运河国家文化公园核心段',           path: '/beiyunhe',    tagBg: 'rgba(0,77,64,0.3)',     barColor: '#00695C' },
  { id: 6,  name: '营城建都绿道',   type: '历史遗址', length: 42,   area: '西城·东城',            desc: '北京千年古城建城脉络',               path: '/yingcheng',   tagBg: 'rgba(121,85,72,0.3)',   barColor: '#795548' },
  { id: 7,  name: '昌平42绿道',     type: '山地型',   length: 42,   area: '昌平区',               desc: '山野田园与绿色运动的融合',           path: '/changping42', tagBg: 'rgba(51,105,30,0.3)',   barColor: '#33691E' },
  { id: 8,  name: '常营半马绿道',   type: '运动型',   length: 21,   area: '朝阳常营',             desc: '专业半程马拉松赛道',                 path: '/changying',   tagBg: 'rgba(183,28,28,0.3)',   barColor: '#B71C1C' },
  { id: 9,  name: '亮马河绿道',     type: '国际风情', length: 5.5,  area: '朝阳亮马河',           desc: '使馆区旁的国际化滨水廊道',           path: '/liangmahe',   tagBg: 'rgba(0,96,100,0.3)',    barColor: '#006064' },
  { id: 10, name: '朝阳绿道',       type: '都市休闲', length: 18,   area: '朝阳区',               desc: '商务文化艺术汇聚的都市廊道',         path: '/chaoyang',    tagBg: 'rgba(230,81,0,0.3)',    barColor: '#BF360C' },
  { id: 11, name: '南沙绿道',       type: '生态郊野', length: 15,   area: '昌平南沙河',           desc: '南沙河滨水生态走廊',                 path: '/nansha',      tagBg: 'rgba(46,125,50,0.3)',   barColor: '#388E3C' },
  { id: 12, name: '丽都商圈绿道',   type: '商圈绿化', length: 6.8,  area: '朝阳丽都',             desc: '繁华商圈中的绿色氧吧',               path: '/lidu',        tagBg: 'rgba(74,20,140,0.3)',   barColor: '#4A148C' }
]

const features = [
  { title: '交互式 WebGIS 地图', desc: '基于 OpenLayers 构建，多图层高性能渲染，流畅展示全市绿道路网', color: '#69F0AE', icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' },
  { title: '绿道详情查询', desc: '点击路线即可查看名称、长度、覆盖区域与景点描述，信息一览无余', color: '#40C4FF', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { title: '地图工具箱', desc: '内置绘制、测量、图层切换、主题切换等专业工具，满足地理分析需求', color: '#FFD740', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
  { title: '夜间 / 日间双主题', desc: '自适应日间与夜间两套地图主题，随时切换，舒适护眼', color: '#EA80FC', icon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
  { title: '用户账号体系', desc: '游客直接浏览，注册用户可收藏绿道、发表评论，管理后台独立部署', color: '#FF6E40', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { title: '移动端适配', desc: '专为手机优化的移动版界面，支持触屏手势，随时随地查询绿道信息', color: '#64FFDA', icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' }
]

// ══════════════════════════════════════════════════
// Canvas 粒子动画
// ══════════════════════════════════════════════════
const canvasRef = ref(null)
let animFrameId = null

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const W = canvas.width, H = canvas.height
  const COUNT = 70, DIST = 140

  const pts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 0.8, a: Math.random() * 0.45 + 0.15
  }))

  const tick = () => {
    ctx.clearRect(0, 0, W, H)
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#060d14'); g.addColorStop(0.5, '#081510'); g.addColorStop(1, '#060d14')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    for (let i = 0; i < COUNT; i++) {
      const p = pts[i]
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > W) p.vx *= -1
      if (p.y < 0 || p.y > H) p.vy *= -1
      for (let j = i + 1; j < COUNT; j++) {
        const q = pts[j]
        const dx = p.x - q.x, dy = p.y - q.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < DIST) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(105,240,174,${(1 - d / DIST) * 0.15})`
          ctx.lineWidth = 0.7
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
        }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(105,240,174,${p.a})`; ctx.fill()
    }
    animFrameId = requestAnimationFrame(tick)
  }
  tick()
}

// ══════════════════════════════════════════════════
// 生命周期
// ══════════════════════════════════════════════════
onMounted(() => {
  initCanvas()
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd)
})

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   根容器 — 固定 100vh，禁止默认滚动
══════════════════════════════════════════════════ */
.fp-root {
  width: 100vw; height: 100vh;
  overflow: hidden;
  background: #060d14;
  color: #e0e8e2;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ── Canvas & 几何装饰（固定于背景层） ── */
.bg-canvas {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}
.geo-decor { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.geo-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(105,240,174,0.055);
  animation: spin linear infinite;
}
.geo-ring--1 { width: 650px; height: 650px; top: -180px; right: -180px; animation-duration: 65s; }
.geo-ring--2 { width: 460px; height: 460px; bottom: 15%; left: -130px; animation-duration: 85s; border-color: rgba(64,196,255,0.04); animation-direction: reverse; }
.geo-ring--3 { width: 280px; height: 280px; top: 55%; right: 8%; animation-duration: 50s; border-color: rgba(234,128,252,0.04); }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════
   固定导航栏
══════════════════════════════════════════════════ */
.lp-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9000;
  padding: 0 48px; height: 70px;
  display: flex; align-items: center;
  background: rgba(6,13,20,0.45);
  backdrop-filter: blur(12px);
  transition: background 0.4s, border-color 0.4s, backdrop-filter 0.4s;
  border-bottom: 1px solid rgba(105,240,174,0.06);
}
.lp-header.scrolled {
  background: rgba(6,13,20,0.92);
  backdrop-filter: blur(22px);
  border-bottom-color: rgba(105,240,174,0.12);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.lp-header__inner {
  width: 100%; max-width: 1280px; margin: 0 auto;
  display: flex; align-items: center; gap: 48px;
}
.lp-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.lp-logo__icon { width: 36px; height: 36px; }
.lp-logo__text {
  font-size: 1.05rem; font-weight: 700; letter-spacing: 0.01em;
  background: linear-gradient(135deg, #A5D6A7, #69F0AE);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; white-space: nowrap;
}
.lp-nav { display: flex; align-items: center; gap: 4px; flex: 1; }
.lp-nav__link {
  display: inline-flex; align-items: center; justify-content: center;
  height: 38px; padding: 0 20px; border-radius: 20px;
  font-size: 1.05rem; color: #90A4AE; text-decoration: none;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap; line-height: 1;
}
.lp-nav__link:hover { color: #CFD8DC; background: rgba(255,255,255,0.05); }
.lp-nav__link.active { color: #A5D6A7; background: rgba(165,214,167,0.1); }
.lp-header__actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ── 通用按钮 ── */
.btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 24px; height: 40px;
  border-radius: 20px; line-height: 1;
  border: 1px solid rgba(165,214,167,0.3); color: #A5D6A7;
  font-size: 1rem; font-weight: 500;
  text-decoration: none; cursor: pointer; background: transparent;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-ghost:hover { background: rgba(165,214,167,0.08); border-color: rgba(165,214,167,0.55); color: #C8E6C9; }
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 0 24px; height: 40px;
  border-radius: 20px; line-height: 1;
  background: linear-gradient(135deg, #2E7D32, #43A047);
  color: #fff; font-size: 1rem; font-weight: 600;
  text-decoration: none; cursor: pointer; border: none;
  white-space: nowrap;
  transition: all 0.25s; box-shadow: 0 4px 14px rgba(46,125,50,0.35);
}
.btn-primary:hover { background: linear-gradient(135deg, #388E3C, #4CAF50); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(46,125,50,0.45); }
.btn-lg { padding: 0 38px; height: 52px; font-size: 1.1rem; border-radius: 28px; }

/* ══════════════════════════════════════════════════
   右侧页面指示点
══════════════════════════════════════════════════ */
.side-dots {
  position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
  z-index: 9000;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.side-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(165,214,167,0.18);
  border: 1.5px solid rgba(165,214,167,0.28);
  cursor: pointer; position: relative; padding: 0;
  transition: all 0.3s;
}
.side-dot:hover { background: rgba(165,214,167,0.4); transform: scale(1.2); }
.side-dot.active {
  background: #69F0AE; border-color: #69F0AE;
  box-shadow: 0 0 10px rgba(105,240,174,0.6);
  transform: scale(1.35);
}
.dot-tip {
  position: absolute; right: calc(100% + 10px); top: 50%; transform: translateY(-50%);
  white-space: nowrap; font-size: 0.7rem; color: rgba(165,214,167,0.75);
  background: rgba(6,13,20,0.85); border: 1px solid rgba(105,240,174,0.15);
  padding: 3px 9px; border-radius: 8px;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.side-dot:hover .dot-tip { opacity: 1; }

/* ══════════════════════════════════════════════════
   分页容器 & 滑块
══════════════════════════════════════════════════ */
.fp-container {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1; overflow: hidden;
}
.fp-slider {
  width: 100%;
  /* 核心：平滑贝塞尔过渡 */
  transition: transform 0.9s cubic-bezier(0.77, 0, 0.175, 1);
  will-change: transform;
}
/* 每个 Section 恰好占满一屏 */
.fp-section {
  width: 100%; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}

/* ══════════════════════════════════════════════════
   Page 0 — Hero
══════════════════════════════════════════════════ */
.fp-hero { align-items: stretch; }
.hero-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; max-width: 1280px; margin: 0 auto;
  padding: 80px 40px 60px; gap: 60px;
}
.hero__content { flex: 1; min-width: 0; }

.hero__badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 18px 6px 10px; border-radius: 20px;
  background: rgba(105,240,174,0.07); border: 1px solid rgba(105,240,174,0.2);
  font-size: 1rem; color: #69F0AE; margin-bottom: 26px;
}
.badge-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #69F0AE;
  animation: pulse-badge 2s ease-in-out infinite;
}
@keyframes pulse-badge {
  0%,100% { box-shadow: 0 0 0 0 rgba(105,240,174,0.6); }
  50%      { box-shadow: 0 0 0 5px rgba(105,240,174,0); }
}

.hero__title {
  font-size: clamp(2.8rem, 5.5vw, 5rem);
  font-weight: 800; line-height: 1.1; margin: 0 0 24px;
  display: flex; flex-direction: column; gap: 4px;
}
.line1 { color: #e8f5e9; }
.line2 {
  background: linear-gradient(135deg, #69F0AE 0%, #A5D6A7 50%, #00E676 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero__desc {
  font-size: 1.5rem; line-height: 1.9; color: #90A4AE;
  margin: 0 0 36px; max-width: 700px;
}
.hero__cta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.cta-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 34px; border-radius: 26px;
  background: linear-gradient(135deg, #2E7D32, #43A047, #66BB6A);
  color: #fff; font-size: 1rem; font-weight: 700; text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 6px 24px rgba(46,125,50,0.5), 0 0 40px rgba(105,240,174,0.12);
}
.cta-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(46,125,50,0.6); }
.cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; border-radius: 26px;
  border: 1.5px solid rgba(165,214,167,0.3);
  color: #A5D6A7; font-size: 0.95rem; background: transparent; cursor: pointer;
  transition: all 0.25s;
}
.cta-secondary:hover { background: rgba(165,214,167,0.07); border-color: rgba(165,214,167,0.55); transform: translateY(-2px); }

/* 向下滚动提示 */
.scroll-hint {
  position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer; color: rgba(165,214,167,0.45); font-size: 0.73rem;
  animation: hint-bob 2s ease-in-out infinite;
}
@keyframes hint-bob {
  0%,100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(7px); }
}
.scroll-hint__mouse {
  width: 22px; height: 36px; border: 1.5px solid rgba(165,214,167,0.3);
  border-radius: 11px; position: relative;
}
.scroll-hint__wheel {
  position: absolute; top: 5px; left: 50%; transform: translateX(-50%);
  width: 3px; height: 7px; background: rgba(105,240,174,0.7);
  border-radius: 2px; animation: wheel-scroll 1.8s ease-in-out infinite;
}
@keyframes wheel-scroll { 0%,100% { top: 5px; opacity: 1; } 75% { top: 18px; opacity: 0; } }

/* 地球仪 */
.hero__visual { flex-shrink: 0; width: 340px; }
.globe-wrap { position: relative; width: 340px; height: 340px; }
.globe-svg { width: 100%; height: 100%; filter: drop-shadow(0 0 28px rgba(105,240,174,0.13)); }
.globe-path { stroke-dasharray: 200; stroke-dashoffset: 200; animation: draw-path 2.8s ease-out 0.6s forwards; }
@keyframes draw-path { to { stroke-dashoffset: 0; } }
.pulse-dot { animation: pulse-node 2.5s ease-in-out infinite; }
@keyframes pulse-node { 0%,100% { opacity: 0.9; } 50% { opacity: 0.4; } }
.city-ring { animation: city-expand 3s ease-in-out infinite; }
@keyframes city-expand { 0%,100% { opacity: 0.5; } 50% { opacity: 0; } }
.orbit {
  position: absolute; border-radius: 50%;
  border: 1px solid transparent; animation: orbital linear infinite; pointer-events: none;
}
.orbit--1 { width: 290px; height: 290px; top: 25px; left: 25px; border-color: rgba(105,240,174,0.14); animation-duration: 11s; }
.orbit--2 { width: 370px; height: 195px; top: 73px; left: -15px; border-color: rgba(64,196,255,0.09); animation-duration: 17s; animation-direction: reverse; }
.orbit__dot {
  width: 7px; height: 7px; border-radius: 50%; background: #69F0AE;
  position: absolute; top: -3.5px; left: 50%; transform: translateX(-50%);
  box-shadow: 0 0 8px #69F0AE;
}
.orbit__dot--2 { background: #40C4FF; box-shadow: 0 0 8px #40C4FF; }
@keyframes orbital { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════
   通用 page-inner / section-heading
══════════════════════════════════════════════════ */
.page-inner {
  width: 100%; max-width: 1280px;
  padding: 80px 40px 36px;
  display: flex; flex-direction: column;
}
.section-heading { text-align: center; margin-bottom: 32px; }
.section-tag {
  display: inline-block; padding: 4px 14px; border-radius: 10px;
  background: rgba(105,240,174,0.07); border: 1px solid rgba(105,240,174,0.2);
  font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em;
  color: #69F0AE; margin-bottom: 14px;
}
.section-title { font-size: clamp(1.8rem, 3.2vw, 2.6rem); font-weight: 800; color: #E8F5E9; margin: 0 0 12px; }
.section-desc { font-size: 1.15rem; color: #78909C; margin: 0; }

/* ══════════════════════════════════════════════════
   Page 1 — Stats
══════════════════════════════════════════════════ */
.fp-stats .page-inner { justify-content: center; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 22px; }
.stat-card {
  background: rgba(13,26,17,0.7); border: 1px solid rgba(105,240,174,0.09);
  border-radius: 16px; padding: 22px 20px; backdrop-filter: blur(12px);
  position: relative; overflow: hidden;
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.55s ease, transform 0.55s ease, border-color 0.3s, box-shadow 0.3s;
}
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(105,240,174,0.35), transparent);
}
.stat-card.visible { opacity: 1; transform: translateY(0); }
.stat-card.visible:nth-child(1) { transition-delay: 0.05s; }
.stat-card.visible:nth-child(2) { transition-delay: 0.15s; }
.stat-card.visible:nth-child(3) { transition-delay: 0.25s; }
.stat-card.visible:nth-child(4) { transition-delay: 0.35s; }
.stat-card:hover { transform: translateY(-4px); border-color: rgba(105,240,174,0.22); box-shadow: 0 12px 28px rgba(0,0,0,0.28); }
.stat-card__icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.stat-card__icon svg { color: #fff; }
.stat-card__num { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
.counter { font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, #A5D6A7, #69F0AE); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
.stat-unit { font-size: 1.1rem; color: #78909C; }
.stat-card__label { font-size: 1.05rem; font-weight: 600; color: #B0BEC5; margin-bottom: 5px; }
.stat-card__sub { font-size: 0.9rem; color: #546E7A; }
.type-bar { display: flex; flex-wrap: wrap; gap: 10px 20px; justify-content: center; }
.type-item { display: flex; align-items: center; gap: 6px; font-size: 0.88rem; color: #78909C; }
.type-dot { width: 8px; height: 8px; border-radius: 50%; }

/* ══════════════════════════════════════════════════
   Page 2 — About
══════════════════════════════════════════════════ */
.fp-about .page-inner { justify-content: center; }
.about-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 48px; align-items: center; }
.about-text { font-size: 1.15rem; line-height: 2; color: #90A4AE; margin: 0 0 22px; }
.about-text strong { color: #A5D6A7; font-weight: 600; }
.about-tags { display: flex; flex-wrap: wrap; gap: 9px; }
.atag { padding: 6px 16px; border-radius: 14px; background: rgba(46,125,50,0.11); border: 1px solid rgba(76,175,80,0.18); font-size: 0.93rem; color: #81C784; }
.about-cards { display: flex; flex-direction: column; gap: 12px; }
.about-mini-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 15px 17px; border-radius: 12px;
  background: rgba(13,26,17,0.6); border: 1px solid rgba(105,240,174,0.07);
  backdrop-filter: blur(8px); transition: border-color 0.2s, transform 0.2s;
}
.about-mini-card:hover { border-color: rgba(105,240,174,0.2); transform: translateX(4px); }
.amc-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.amc-title { font-size: 1.05rem; font-weight: 600; color: #CFD8DC; margin-bottom: 5px; }
.amc-desc { font-size: 0.95rem; color: #78909C; line-height: 1.65; }

/* ══════════════════════════════════════════════════
   Page 3 — Greenways（12 张卡片 6 列 × 2 行）
══════════════════════════════════════════════════ */
.fp-greenways .page-inner { justify-content: center; padding-bottom: 20px; }
.gw-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px; margin-bottom: 18px;
}
.gw-card {
  display: flex; flex-direction: column;
  background: rgba(10,20,14,0.82); border: 1px solid rgba(105,240,174,0.07);
  border-radius: 12px; text-decoration: none; overflow: hidden;
  transition: all 0.3s;
}
.gw-card:hover { transform: translateY(-4px); border-color: rgba(105,240,174,0.22); box-shadow: 0 12px 26px rgba(0,0,0,0.3); }
.gw-card__top { display: flex; justify-content: space-between; align-items: center; padding: 9px 11px 5px; }
.gw-tag { padding: 2px 9px; border-radius: 7px; font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
.gw-len { font-size: 0.8rem; font-weight: 700; color: #69F0AE; white-space: nowrap; }
.gw-card__body { padding: 2px 11px 7px; flex: 1; }
.gw-name { font-size: 0.92rem; font-weight: 700; color: #E8F5E9; margin: 0 0 4px; line-height: 1.3; }
.gw-desc { font-size: 0.8rem; color: #607D8B; line-height: 1.55; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.gw-card__foot { display: flex; justify-content: space-between; align-items: center; padding: 6px 11px 9px; border-top: 1px solid rgba(105,240,174,0.06); }
.gw-area { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #546E7A; }
.gw-arrow { color: rgba(105,240,174,0.32); transition: transform 0.2s, color 0.2s; }
.gw-card:hover .gw-arrow { transform: translateX(3px); color: #69F0AE; }
.gw-card__bar { height: 3px; opacity: 0.65; transition: opacity 0.2s; }
.gw-card:hover .gw-card__bar { opacity: 1; }
.gw-cta { text-align: center; }

/* ══════════════════════════════════════════════════
   Page 4 — Features
══════════════════════════════════════════════════ */
.fp-features .page-inner { justify-content: center; }
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feat-card {
  position: relative; overflow: hidden; padding: 26px 22px; border-radius: 16px;
  background: rgba(10,20,14,0.72); border: 1px solid rgba(105,240,174,0.07);
  backdrop-filter: blur(10px); transition: all 0.35s;
}
.feat-card:hover { transform: translateY(-5px); border-color: rgba(105,240,174,0.18); box-shadow: 0 18px 40px rgba(0,0,0,0.3); }
.feat-icon {
  width: 48px; height: 48px; border-radius: 13px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; color: var(--fc, #69F0AE);
  transition: background 0.3s, border-color 0.3s;
}
.feat-card:hover .feat-icon { background: color-mix(in srgb, var(--fc, #69F0AE) 11%, transparent); border-color: color-mix(in srgb, var(--fc, #69F0AE) 22%, transparent); }
.feat-title { font-size: 1.1rem; font-weight: 700; color: #CFD8DC; margin: 0 0 10px; }
.feat-desc { font-size: 1rem; color: #607D8B; line-height: 1.8; margin: 0; }
.feat-glow { position: absolute; right: -26px; bottom: -26px; width: 86px; height: 86px; border-radius: 50%; opacity: 0.04; filter: blur(16px); transition: opacity 0.3s; }
.feat-card:hover .feat-glow { opacity: 0.09; }

/* ══════════════════════════════════════════════════
   Page 5 — Final (CTA + Footer)
══════════════════════════════════════════════════ */
.fp-final { align-items: stretch; flex-direction: column; justify-content: center; }
.final-inner {
  width: 100%; max-width: 1280px; margin: 0 auto;
  padding: 60px 40px 28px;
  display: flex; flex-direction: column; gap: 36px;
  justify-content: center; height: 100%;
}
.banner-card {
  display: flex; align-items: center; justify-content: space-between; gap: 40px;
  padding: 38px 50px; border-radius: 22px;
  background: linear-gradient(135deg, rgba(27,94,32,0.28) 0%, rgba(13,40,18,0.55) 50%, rgba(6,13,20,0.45) 100%);
  border: 1px solid rgba(105,240,174,0.14);
  box-shadow: 0 0 55px rgba(46,125,50,0.12), inset 0 1px 0 rgba(105,240,174,0.07);
  backdrop-filter: blur(16px);
}
.banner-text h2 { font-size: 1.9rem; font-weight: 800; color: #E8F5E9; margin: 0 0 12px; line-height: 1.35; }
.banner-text p { font-size: 1.15rem; color: #78909C; margin: 0; }
.banner-actions { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

.lp-footer { border-top: 1px solid rgba(105,240,174,0.06); padding-top: 24px; }
.footer-inner { display: flex; gap: 55px; margin-bottom: 20px; }
.footer-brand { flex: 0 0 210px; }
.footer-slogan { font-size: 0.93rem; color: #546E7A; margin: 8px 0 0; }
.footer-links { flex: 1; display: flex; gap: 48px; }
.fl-group { display: flex; flex-direction: column; gap: 9px; }
.fl-title { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; color: #A5D6A7; text-transform: uppercase; margin-bottom: 6px; }
.fl-link { font-size: 0.95rem; color: #607D8B; text-decoration: none; cursor: default; transition: color 0.2s; }
a.fl-link { cursor: pointer; }
a.fl-link:hover { color: #A5D6A7; }
.footer-bottom { display: flex; align-items: center; gap: 8px; padding-top: 16px; border-top: 1px solid rgba(105,240,174,0.05); font-size: 0.73rem; color: #37474F; }
.footer-sep { color: #455A64; }

/* ══════════════════════════════════════════════════
   响应式
══════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .gw-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 900px) {
  .hero-inner { flex-direction: column; padding-top: 90px; gap: 24px; }
  .hero__visual { width: 220px; }
  .globe-wrap { width: 220px; height: 220px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .about-grid { grid-template-columns: 1fr; gap: 28px; }
  .feat-grid { grid-template-columns: repeat(2, 1fr); }
  .gw-grid { grid-template-columns: repeat(3, 1fr); }
  .banner-card { flex-direction: column; text-align: center; padding: 30px 24px; }
  .footer-inner { flex-direction: column; gap: 24px; }
  .lp-nav { display: none; }
  .side-dots { display: none; }
}
@media (max-width: 600px) {
  .hero-inner, .page-inner, .final-inner { padding-left: 20px; padding-right: 20px; }
  .lp-header { padding: 0 20px; }
  .feat-grid { grid-template-columns: 1fr; }
  .gw-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-links { flex-wrap: wrap; gap: 22px; }
}
</style>
