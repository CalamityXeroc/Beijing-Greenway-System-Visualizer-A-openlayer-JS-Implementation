<template>
  <div class="agreement-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h1>用户协议</h1>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="last-updated">最后更新：2024 年 12 月</div>

      <section class="section">
        <h2>1. 服务说明</h2>
        <p>北京绿道应用（以下简称"本应用"）提供北京市绿道信息查询、导航、社区互动等服务。使用本应用即表示您同意本协议的全部条款。</p>
      </section>

      <section class="section">
        <h2>2. 用户账户</h2>
        <ul>
          <li>您需要注册账户才能使用部分功能</li>
          <li>您对账户下的所有活动负责</li>
          <li>请妥善保管您的登录密码</li>
          <li>如发现账户异常，请立即通知我们</li>
        </ul>
      </section>

      <section class="section">
        <h2>3. 用户行为规范</h2>
        <p>使用本应用时，您同意：</p>
        <ul>
          <li>不发布违法、违规信息</li>
          <li>不侵犯他人合法权益</li>
          <li>不干扰应用正常运行</li>
          <li>不利用漏洞获取不当利益</li>
          <li>不发布垃圾广告或重复内容</li>
        </ul>
      </section>

      <section class="section">
        <h2>4. 内容版权</h2>
        <p>本应用中的绿道数据、地图信息版权归相关政府部门所有。用户发布的评论、照片等内容，版权归用户本人所有，但授予本应用在平台内使用的许可。</p>
      </section>

      <section class="section">
        <h2>5. 免责声明</h2>
        <ul>
          <li>绿道信息仅供参考，实际以现场为准</li>
          <li>骑行和徒步活动风险自负</li>
          <li>因不可抗力导致的服务中断不承担责任</li>
        </ul>
      </section>

      <section class="section">
        <h2>6. 协议变更</h2>
        <p>我们可能会更新本协议。重大变更将通过应用内通知告知。继续使用即视为接受修改后的协议。</p>
      </section>

      <section class="section">
        <h2>7. 联系我们</h2>
        <p class="contact">邮箱：support@bjgreenway.cn</p>
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
.agreement-page {
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
