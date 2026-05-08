<template>
  <div class="privacy-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>隐私政策</h1>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="last-updated">最后更新：2024 年 12 月</div>

      <section class="section">
        <h2>1. 信息收集</h2>
        <p>我们收集您在使用北京绿道应用时提供的信息，包括：</p>
        <ul>
          <li><strong>注册信息：</strong>用户名、邮箱地址、密码（加密存储）</li>
          <li><strong>个人资料：</strong>昵称、头像、手机号（可选）</li>
          <li><strong>使用数据：</strong>浏览记录、收藏绿道、骑行路线</li>
          <li><strong>位置数据：</strong>您在使用地图功能时提供的位置信息</li>
        </ul>
      </section>

      <section class="section">
        <h2>2. 信息使用</h2>
        <p>我们收集的信息用于以下目的：</p>
        <ul>
          <li>提供、维护和改进绿道导览服务</li>
          <li>个性化您的使用体验</li>
          <li>发送与服务相关的通知</li>
          <li>分析使用趋势以优化功能</li>
        </ul>
      </section>

      <section class="section">
        <h2>3. 信息共享</h2>
        <p>我们不会将您的个人信息出售给第三方。我们可能在以下情况下共享信息：</p>
        <ul>
          <li>获得您的明确同意</li>
          <li>法律法规要求</li>
          <li>保护用户权益或公共安全</li>
        </ul>
      </section>

      <section class="section">
        <h2>4. 数据安全</h2>
        <p>我们采用行业标准的安全措施保护您的数据：</p>
        <ul>
          <li>密码使用 bcrypt 加密存储</li>
          <li>通信使用 HTTPS 加密</li>
          <li>定期安全审计</li>
        </ul>
      </section>

      <section class="section">
        <h2>5. 您的权利</h2>
        <p>您有权：</p>
        <ul>
          <li>查阅和修改您的个人信息</li>
          <li>删除您的账号</li>
          <li>拒绝收集非必要信息</li>
          <li>注销账号</li>
        </ul>
      </section>

      <section class="section">
        <h2>6. 联系我们</h2>
        <p>如有隐私相关问题，请通过以下方式联系我们：</p>
        <p class="contact">邮箱：privacy@bjgreenway.cn</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
</script>

<style scoped>
.privacy-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 16px 14px;
}
.topbar h1 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-radius: 50%;
  cursor: pointer;
}
.placeholder { width: 36px; }

.content {
  padding: 16px;
  line-height: 1.8;
}
.last-updated {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: 24px;
}

.section {
  margin-bottom: 24px;
}
.section h2 {
  font-size: var(--text-heading-md);
  font-weight: var(--font-weight-bold);
  margin: 0 0 12px;
  color: var(--color-text-primary);
}
.section p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 8px;
}
.section ul {
  padding-left: 20px;
  margin: 8px 0;
}
.section li {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.contact {
  background: var(--color-surface-2);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-family: monospace;
  font-size: var(--text-sm);
}
</style>
