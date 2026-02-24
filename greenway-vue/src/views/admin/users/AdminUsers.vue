<template>
  <div class="user-mgmt">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-desc">管理平台注册用户账号与权限</p>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="s-icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="filter.keyword" class="search-input"
               placeholder="搜索用户名/邮箱/昵称" @input="debouncedSearch" />
      </div>
      <select v-model="filter.role" class="sel" @change="loadUsers">
        <option value="">全部角色</option>
        <option value="admin">管理员</option>
        <option value="user">普通用户</option>
      </select>
      <select v-model="filter.status" class="sel" @change="loadUsers">
        <option value="">全部状态</option>
        <option value="active">正常</option>
        <option value="disabled">已禁用</option>
      </select>
      <button class="btn-outline" @click="loadUsers">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        刷新
      </button>
    </div>

    <!-- 表格 -->
    <div class="table-wrap">
      <div v-if="loading" class="table-loading">数据加载中...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>用户名</th><th>邮箱</th><th>昵称</th>
            <th>角色</th><th>状态</th><th>注册时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="td-id">{{ u.id }}</td>
            <td class="td-username">{{ u.username }}</td>
            <td class="td-email">{{ u.email }}</td>
            <td>{{ u.nickname || '—' }}</td>
            <td>
              <span class="badge" :class="u.role === 'admin' ? 'badge-admin' : 'badge-user'">
                {{ u.role === 'admin' ? '管理员' : '用户' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="u.status === 'active' ? 'badge-active' : 'badge-disabled'">
                {{ u.status === 'active' ? '正常' : '禁用' }}
              </span>
            </td>
            <td class="td-time">{{ formatDate(u.created_at) }}</td>
            <td class="td-actions">
              <button class="act-btn edit-btn" @click="openEdit(u)" title="编辑">编辑</button>
              <button class="act-btn"
                      :class="u.status === 'active' ? 'disable-btn' : 'enable-btn'"
                      @click="toggleStatus(u)">
                {{ u.status === 'active' ? '禁用' : '启用' }}
              </button>
              <button class="act-btn del-btn" @click="deleteUser(u)">删除</button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="8" class="empty-row">暂无用户数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="!loading">
      <span class="pg-info">共 {{ total }} 条，第 {{ filter.page }}/{{ totalPages }} 页</span>
      <div class="pg-btns">
        <button class="pg-btn" :disabled="filter.page <= 1" @click="goPage(filter.page - 1)">上一页</button>
        <button v-for="p in visiblePages" :key="p"
                class="pg-btn" :class="{ active: p === filter.page }" @click="goPage(p)">{{ p }}</button>
        <button class="pg-btn" :disabled="filter.page >= totalPages" @click="goPage(filter.page + 1)">下一页</button>
      </div>
    </div>
  </div>

  <!-- 编辑弹窗 -->
  <div class="modal-mask" v-if="editDialog.show" @click.self="editDialog.show = false">
    <div class="modal">
      <div class="modal-head">
        <span>编辑用户 · {{ editDialog.form.username }}</span>
        <button class="modal-close" @click="editDialog.show = false">✕</button>
      </div>
      <div class="modal-body">
        <label class="form-item">
          <span>昵称</span>
          <input v-model="editDialog.form.nickname" class="form-input" placeholder="请输入昵称" />
        </label>
        <label class="form-item">
          <span>邮箱</span>
          <input v-model="editDialog.form.email" class="form-input" type="email" placeholder="请输入邮箱" />
        </label>
        <label class="form-item">
          <span>角色</span>
          <select v-model="editDialog.form.role" class="form-input">
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </label>
        <label class="form-item">
          <span>状态</span>
          <select v-model="editDialog.form.status" class="form-input">
            <option value="active">正常</option>
            <option value="disabled">禁用</option>
          </select>
        </label>
        <p v-if="editDialog.err" class="form-err">{{ editDialog.err }}</p>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" @click="editDialog.show = false">取消</button>
        <button class="btn-primary" :disabled="editDialog.saving" @click="saveEdit">
          {{ editDialog.saving ? '保存中...' : '保存更改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminAuth } from '@/stores/adminAuth'

const { apiFetch } = useAdminAuth()

const loading = ref(true)
const users   = ref([])
const total   = ref(0)

const filter = ref({ keyword: '', role: '', status: '', page: 1, pageSize: 15 })

const totalPages  = computed(() => Math.max(1, Math.ceil(total.value / filter.value.pageSize)))
const visiblePages = computed(() => {
  const cur = filter.value.page, max = totalPages.value
  const pages = []
  for (let p = Math.max(1, cur - 2); p <= Math.min(max, cur + 2); p++) pages.push(p)
  return pages
})

async function loadUsers() {
  loading.value = true
  try {
    const q = new URLSearchParams({
      page: filter.value.page,
      pageSize: filter.value.pageSize,
      keyword: filter.value.keyword,
      role: filter.value.role,
      status: filter.value.status
    })
    const json = await apiFetch(`/api/admin/users?${q}`)
    // 后端返回: { code, data: { list, total, page, pageSize } }
    users.value = json.data?.list || []
    total.value = json.data?.total || 0
  } catch (e) {
    console.warn('loadUsers failed', e)
  } finally {
    loading.value = false
  }
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  filter.value.page = 1
  searchTimer = setTimeout(loadUsers, 400)
}

function goPage(p) {
  filter.value.page = p
  loadUsers()
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

/* 状态切换 */
async function toggleStatus(u) {
  const newStatus = u.status === 'active' ? 'disabled' : 'active'
  const label = newStatus === 'disabled' ? '禁用' : '启用'
  if (!confirm(`确定要${label}用户 "${u.username}" 吗？`)) return
  try {
    await apiFetch(`/api/admin/users/${u.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })
    await loadUsers()
  } catch(e) {
    alert(e.message || '操作失败，请重试')
  }
}

/* 删除 */
async function deleteUser(u) {
  if (!confirm(`确定要删除用户 "${u.username}"？此操作不可撤销！`)) return
  try {
    await apiFetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    filter.value.page = 1; await loadUsers()
  } catch(e) {
    alert(e.message || '删除失败，请重试')
  }
}

/* 编辑弹窗 */
const editDialog = ref({ show: false, form: {}, saving: false, err: '' })
function openEdit(u) {
  editDialog.value = {
    show: true, saving: false, err: '',
    form: { id: u.id, username: u.username, nickname: u.nickname || '', email: u.email, role: u.role, status: u.status }
  }
}
async function saveEdit() {
  editDialog.value.err = ''
  editDialog.value.saving = true
  try {
    const { id, nickname, email, role, status } = editDialog.value.form
    await apiFetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nickname, email, role, status })
    })
    editDialog.value.show = false
    await loadUsers()
  } catch (e) {
    editDialog.value.err = e.message || '保存失败'
  } finally {
    editDialog.value.saving = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.user-mgmt { max-width: 1200px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.page-desc   { font-size: 0.875rem; color: #6b7280; margin: 0; }

/* 工具栏 */
.toolbar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: #fff;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}
.search-wrap {
  position: relative; flex: 1; min-width: 180px;
}
.s-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input {
  width: 100%; padding: 8px 10px 8px 32px;
  border: 1px solid #e5e7eb; border-radius: 7px;
  font-size: 0.875rem; outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input:focus { border-color: #2E7D32; }
.sel {
  padding: 8px 10px;
  border: 1px solid #e5e7eb; border-radius: 7px;
  font-size: 0.875rem; background: #fff; outline: none; cursor: pointer;
}
.btn-outline {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 14px;
  border: 1px solid #e5e7eb; border-radius: 7px;
  background: #fff; font-size: 0.875rem; cursor: pointer; color: #374151;
  transition: border-color 0.2s;
}
.btn-outline:hover { border-color: #2E7D32; color: #2E7D32; }

/* 表格 */
.table-wrap {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  margin-bottom: 16px;
}
.table-loading { padding: 40px; text-align: center; color: #9ca3af; font-size: 0.875rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 12px 14px;
  text-align: left; font-size: 0.8rem; font-weight: 600;
  color: #6b7280; background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.data-table td {
  padding: 12px 14px;
  font-size: 0.875rem; color: #374151;
  border-bottom: 1px solid #f3f4f6;
}
tr:last-child td { border-bottom: none; }
.td-id { color: #9ca3af; font-size: 0.8rem; }
.td-username { font-weight: 600; color: #111827; }
.td-email { color: #6b7280; }
.td-time { color: #9ca3af; font-size: 0.8rem; white-space: nowrap; }
.empty-row { text-align: center; color: #9ca3af; padding: 40px; }

/* 徽标 */
.badge {
  display: inline-block; padding: 2px 9px;
  border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}
.badge-admin   { background: #f3e8ff; color: #7c3aed; }
.badge-user    { background: #e8f5e9; color: #2E7D32; }
.badge-active  { background: #d1fae5; color: #065f46; }
.badge-disabled{ background: #fee2e2; color: #991b1b; }

/* 操作按钮 */
.td-actions { display: flex; gap: 6px; align-items: center; }
.act-btn {
  padding: 4px 10px; border-radius: 5px; font-size: 0.78rem;
  border: 1px solid transparent; cursor: pointer; font-weight: 500;
  transition: opacity 0.2s;
}
.act-btn:hover { opacity: 0.8; }
.edit-btn    { background: #e8f5e9; color: #2E7D32; border-color: #a5d6a7; }
.disable-btn { background: #fff3e0; color: #E65100; border-color: #ffcc80; }
.enable-btn  { background: #e3f2fd; color: #1565C0; border-color: #90caf9; }
.del-btn     { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }

/* 分页 */
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.pg-info { font-size: 0.82rem; color: #6b7280; }
.pg-btns { display: flex; gap: 4px; }
.pg-btn {
  padding: 5px 11px; border-radius: 6px;
  border: 1px solid #e5e7eb; background: #fff;
  font-size: 0.82rem; cursor: pointer; color: #374151;
  transition: background 0.15s, border-color 0.15s;
}
.pg-btn:hover:not(:disabled) { border-color: #2E7D32; color: #2E7D32; }
.pg-btn.active { background: #2E7D32; color: #fff; border-color: #2E7D32; }
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* 编辑弹窗 */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal {
  background: #fff;
  border-radius: 14px;
  width: 420px; max-width: calc(100vw - 32px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 700; font-size: 0.95rem; color: #111827;
}
.modal-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: 1rem; padding: 2px 6px; border-radius: 4px;
}
.modal-close:hover { background: #f3f4f6; color: #374151; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.form-item { display: flex; flex-direction: column; gap: 5px; }
.form-item > span { font-size: 0.8rem; font-weight: 600; color: #374151; }
.form-input {
  padding: 9px 12px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.875rem; outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: #2E7D32; }
.form-err { color: #ef4444; font-size: 0.82rem; margin: 0; }
.modal-foot {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid #e5e7eb;
}
.btn-cancel {
  padding: 8px 20px; border-radius: 8px;
  border: 1px solid #e5e7eb; background: #fff;
  font-size: 0.875rem; cursor: pointer; color: #374151;
}
.btn-primary {
  padding: 8px 22px; border-radius: 8px;
  background: #2E7D32; color: #fff;
  border: none; font-size: 0.875rem; cursor: pointer; font-weight: 600;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #1B5E20; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* ===== 夜间模式 ===== */
[data-theme="night"] .page-title { color: #e8e8e8; }
[data-theme="night"] .page-desc  { color: #9ca3af; }
[data-theme="night"] .filter-bar {
  background: #1e1e1e; border: 1px solid #2a2a2a;
}
[data-theme="night"] .search-input {
  background: #252525; border-color: #3a3a3a; color: #e8e8e8;
}
[data-theme="night"] .search-input::placeholder { color: #6b7280; }
[data-theme="night"] .s-icon { color: #6b7280; }
[data-theme="night"] .sel,
[data-theme="night"] .role-sel {
  background: #252525; border-color: #3a3a3a; color: #e8e8e8;
}
[data-theme="night"] .btn-outline {
  background: #252525; border-color: #3a3a3a; color: #9ca3af;
}
[data-theme="night"] .btn-outline:hover { border-color: #4CAF50; color: #A5D6A7; }
[data-theme="night"] .table-wrap {
  background: #1e1e1e; border-color: #2a2a2a;
}
[data-theme="night"] .data-table th {
  background: #252525; color: #9ca3af; border-bottom-color: #2a2a2a;
}
[data-theme="night"] .data-table td {
  color: #c8c8c8; border-bottom-color: #252525;
}
[data-theme="night"] .td-id       { color: #6b7280; }
[data-theme="night"] .td-username { color: #e8e8e8; }
[data-theme="night"] .pg-btn {
  background: #1e1e1e; border-color: #2a2a2a; color: #9ca3af;
}
[data-theme="night"] .pg-btn:hover:not(:disabled) { border-color: #4CAF50; color: #A5D6A7; }
[data-theme="night"] .pg-btn.active { background: #2E7D32; color: #fff; border-color: #2E7D32; }
[data-theme="night"] .pg-info { color: #6b7280; }
[data-theme="night"] .modal-wrap { background: rgba(0,0,0,0.75); }
[data-theme="night"] .modal-box {
  background: #1a1a1a; border: 1px solid #2a2a2a;
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
}
[data-theme="night"] .modal-head {
  color: #e8e8e8; border-bottom-color: #2a2a2a;
}
[data-theme="night"] .modal-close { color: #6b7280; }
[data-theme="night"] .modal-close:hover { background: #2a2a2a; color: #e8e8e8; }
[data-theme="night"] .form-item > span { color: #a5d6a7; }
[data-theme="night"] .form-input {
  background: #252525; border-color: #3a3a3a; color: #e8e8e8;
}
[data-theme="night"] .form-input:focus { border-color: #4CAF50; background: #2a2a2a; }
[data-theme="night"] .modal-foot { border-top-color: #2a2a2a; }
[data-theme="night"] .btn-cancel {
  background: #252525; border-color: #3a3a3a; color: #9ca3af;
}
</style>
