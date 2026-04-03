<template>
  <div class="admin-users-page">
    <!-- 顶部导航 -->
    <div class="page-nav">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <h1>用户管理</h1>
      <button class="refresh-btn" @click="loadUsers">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-filter">
      <div class="search-bar-input">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="keyword" type="text" placeholder="搜索用户名/邮箱/昵称" @input="debouncedSearch" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; loadUsers()">✕</button>
      </div>
      <div class="filter-row">
        <button class="filter-chip" :class="{ active: !roleFilter }" @click="roleFilter = ''; loadUsers()">全部</button>
        <button class="filter-chip" :class="{ active: roleFilter === 'admin' }" @click="roleFilter = 'admin'; loadUsers()">管理员</button>
        <button class="filter-chip" :class="{ active: roleFilter === 'user' }" @click="roleFilter = 'user'; loadUsers()">普通用户</button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list" v-if="!loading">
      <div class="user-card" v-for="user in users" :key="user.id" @click="showUserActions(user)">
        <div class="user-avatar" :style="{ background: getAvatarBg(user.username) }">
          {{ (user.nickname || user.username)?.charAt(0) || '?' }}
        </div>
        <div class="user-info">
          <div class="user-name">
            {{ user.nickname || user.username }}
            <span class="role-badge" :class="user.role">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
          </div>
          <div class="user-meta">
            <span>@{{ user.username }}</span>
            <span class="dot">·</span>
            <span>{{ user.email || '无邮箱' }}</span>
          </div>
          <div class="user-status">
            <span class="status-tag" :class="user.status">{{ user.status === 'active' ? '正常' : '已禁用' }}</span>
            <span class="join-date">{{ formatDate(user.created_at) }} 注册</span>
          </div>
        </div>
        <svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <div v-if="!users.length" class="empty-state-enhanced">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p class="empty-state-title">暂无用户</p>
        <p class="empty-state-desc">没有找到符合条件的用户</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-skeleton">
      <div class="skeleton-user" v-for="i in 5" :key="i">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-text" style="width: 120px;"></div>
          <div class="skeleton skeleton-text-sm" style="width: 180px;"></div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="!loading && totalPages > 1">
      <button class="pg-btn" :disabled="page <= 1" @click="page--; loadUsers()">上一页</button>
      <span class="pg-info">{{ page }} / {{ totalPages }}</span>
      <button class="pg-btn" :disabled="page >= totalPages" @click="page++; loadUsers()">下一页</button>
    </div>

    <!-- 操作面板 -->
    <Teleport to="body">
      <Transition name="action-sheet">
        <div v-if="showActions" class="action-sheet-mask" @click="showActions = false">
          <div class="action-sheet" @click.stop>
            <div class="action-sheet-header">
              <div class="user-avatar sm" :style="{ background: getAvatarBg(selectedUser?.username) }">
                {{ (selectedUser?.nickname || selectedUser?.username)?.charAt(0) || '?' }}
              </div>
              <div>
                <div class="sheet-title">{{ selectedUser?.nickname || selectedUser?.username }}</div>
                <div class="sheet-subtitle">@{{ selectedUser?.username }}</div>
              </div>
            </div>
            <div class="action-sheet-group">
              <button class="action-sheet-btn" @click="editUser">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                编辑用户信息
              </button>
              <button class="action-sheet-btn" @click="toggleUserStatus">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
                  <path v-if="selectedUser?.status !== 'disabled'" d="M12 8v8"/>
                </svg>
                {{ selectedUser?.status === 'active' ? '禁用账号' : '启用账号' }}
              </button>
              <button class="action-sheet-btn" @click="toggleUserRole">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                {{ selectedUser?.role === 'admin' ? '降为普通用户' : '升为管理员' }}
              </button>
              <button class="action-sheet-btn destructive" @click="confirmDeleteUser">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                删除用户
              </button>
            </div>
            <div class="action-sheet-group">
              <button class="action-sheet-btn action-sheet-cancel" @click="showActions = false">取消</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="bottom-safe"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '@/stores/adminAuth'
import { fetchAdminUsers, updateUserStatus, updateUser, deleteUser } from '../services/api'

const router = useRouter()
const { token, isLoggedIn } = useAdminAuth()

const loading = ref(true)
const users = ref([])
const keyword = ref('')
const roleFilter = ref('')
const page = ref(1)
const pageSize = 15
const total = ref(0)
const totalPages = ref(1)

const showActions = ref(false)
const selectedUser = ref(null)

const goBack = () => router.back()

const getAvatarBg = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #fc4a1a, #f7b733)',
    'linear-gradient(135deg, #4facfe, #00f2fe)'
  ]
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const loadUsers = async () => {
  if (!isLoggedIn.value) {
    router.replace('/admin/login')
    return
  }
  loading.value = true
  try {
    const res = await fetchAdminUsers({
      keyword: keyword.value,
      role: roleFilter.value,
      status: '',
      page: page.value,
      pageSize
    }, token.value)
    users.value = res.data?.list || []
    total.value = res.data?.total || 0
    totalPages.value = Math.max(1, Math.ceil(total.value / pageSize))
  } catch (e) {
    console.error('加载用户失败:', e)
  } finally {
    loading.value = false
  }
}

let searchTimer = null
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  page.value = 1
  searchTimer = setTimeout(loadUsers, 400)
}

const showUserActions = (user) => {
  selectedUser.value = user
  showActions.value = true
}

const editUser = () => {
  alert('编辑功能即将推出，请前往Web管理后台操作')
  showActions.value = false
}

const toggleUserStatus = async () => {
  if (!selectedUser.value) return
  const newStatus = selectedUser.value.status === 'active' ? 'disabled' : 'active'
  const label = newStatus === 'disabled' ? '禁用' : '启用'
  if (!confirm(`确定要${label}用户 "${selectedUser.value.username}" 吗？`)) return
  try {
    await updateUserStatus(selectedUser.value.id, newStatus, token.value)
    showActions.value = false
    await loadUsers()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const toggleUserRole = async () => {
  if (!selectedUser.value) return
  const newRole = selectedUser.value.role === 'admin' ? 'user' : 'admin'
  const label = newRole === 'admin' ? '升为管理员' : '降为普通用户'
  if (!confirm(`确定要将用户 "${selectedUser.value.username}" ${label}吗？`)) return
  try {
    await updateUser(selectedUser.value.id, { role: newRole }, token.value)
    showActions.value = false
    await loadUsers()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const confirmDeleteUser = async () => {
  if (!selectedUser.value) return
  if (!confirm(`确定要删除用户 "${selectedUser.value.username}"？此操作不可撤销！`)) return
  try {
    await deleteUser(selectedUser.value.id, token.value)
    showActions.value = false
    page.value = 1
    await loadUsers()
  } catch (e) {
    alert(e.message || '删除失败')
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.admin-users-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.page-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(env(safe-area-inset-top, 12px) + 8px) 16px 14px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.page-nav h1 {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}
.back-btn, .refresh-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  border: none;
  border-radius: 50%;
  color: var(--color-text-primary);
  cursor: pointer;
}

/* 搜索筛选 */
.search-filter {
  padding: 12px 16px;
  background: var(--color-surface);
  border-bottom: 0.5px solid var(--color-border);
}
.search-bar-input {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  margin-bottom: 12px;
}
.search-bar-input input {
  flex: 1;
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}
.search-bar-input input::placeholder { color: var(--color-text-tertiary); }
.clear-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-text-tertiary);
  color: var(--color-surface);
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
}
.filter-row {
  display: flex;
  gap: 8px;
}
.filter-chip {
  padding: 6px 14px;
  background: var(--color-surface-2);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.filter-chip.active {
  background: var(--color-primary);
  color: #fff;
}

/* 用户列表 */
.user-list {
  padding: 12px 16px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.user-card:active { transform: scale(0.98); }
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
.user-avatar.sm {
  width: 40px;
  height: 40px;
  font-size: 16px;
}
.user-info { flex: 1; min-width: 0; }
.user-name {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.role-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.role-badge.admin { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.role-badge.user { background: var(--fill-primary); color: var(--color-primary); }
.user-meta {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dot { opacity: 0.5; }
.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.status-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.status-tag.active { background: var(--fill-primary); color: var(--color-primary); }
.status-tag.disabled { background: var(--fill-error); color: var(--color-error); }
.join-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
.chevron { color: var(--color-text-tertiary); flex-shrink: 0; }

/* 骨架屏 */
.loading-skeleton { padding: 12px 16px; }
.skeleton-user {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
}
.skeleton-info { flex: 1; }

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}
.pg-btn {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pg-info {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* 操作面板 */
.action-sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 0.5px solid var(--color-divider);
}
.sheet-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
.sheet-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
.action-sheet-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
}
.action-sheet-btn + .action-sheet-btn { border-top: 0.5px solid var(--color-divider); }
.action-sheet-btn:active { background: var(--color-surface-2); }
.action-sheet-btn.destructive { color: var(--color-error); }
.action-sheet-cancel { justify-content: center; font-weight: var(--font-weight-semibold); }

/* 过渡动画 */
.action-sheet-enter-active .action-sheet { animation: slideUp 0.3s ease; }
.action-sheet-leave-active .action-sheet { animation: slideUp 0.2s ease reverse; }

.bottom-safe {
  height: calc(env(safe-area-inset-bottom, 0px) + 20px);
}
</style>
