import crypto from 'crypto';

const BASE_URL = process.env.BACKEND_BASE_URL || 'http://127.0.0.1:3001';
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || '123456';
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '123456';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const msg = data.message || data.error || response.statusText || 'request failed';
    throw new Error(`${options.method || 'GET'} ${path} failed: ${msg}`);
  }

  return data;
}

async function main() {
  const runTag = `e2e-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const username = `u_${runTag}`;
  const email = `${username}@example.com`;
  const commentContent = `Comment flow ${runTag}`;

  const greenways = await requestJson('/api/greenways');
  const first = greenways.features?.[0]?.properties;
  assert(first?.id, 'No greenway found in /api/greenways');
  const greenwayId = first.id;

  const registerResp = await requestJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password: TEST_PASSWORD,
      nickname: username
    })
  });
  const userToken = registerResp.data?.token;
  assert(userToken, 'User register/login token missing');

  const createResp = await requestJson('/api/comments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      greenwayId,
      content: commentContent,
      rating: 5
    })
  });

  const createdId = createResp.data?.id;
  assert(createdId, 'Created comment id missing');
  assert(createResp.data?.status === 'pending', 'New comment status is not pending');

  const preVisible = await requestJson(`/api/comments?greenwayId=${greenwayId}&sort=newest`);
  const preVisibleIds = (preVisible.data?.list || []).map((x) => x.id);
  assert(!preVisibleIds.includes(createdId), 'Pending comment should not be visible before moderation');

  const adminLogin = await requestJson('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD })
  });
  const adminToken = adminLogin.data?.token;
  assert(adminToken, 'Admin token missing');

  await requestJson(`/api/admin/comments/${createdId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'visible' })
  });

  const postVisible = await requestJson(`/api/comments?greenwayId=${greenwayId}&sort=newest`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const postVisibleIds = (postVisible.data?.list || []).map((x) => x.id);
  assert(postVisibleIds.includes(createdId), 'Approved comment should be visible after moderation');

  const meResp = await requestJson('/api/comments/me?page=1&pageSize=10', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const meIds = (meResp.data?.list || []).map((x) => x.id);
  assert(meIds.includes(createdId), 'Created comment should appear in my comments list');

  console.log('[PASS] comments flow verified');
  console.log(`- greenwayId: ${greenwayId}`);
  console.log(`- test user: ${username}`);
  console.log(`- commentId: ${createdId}`);
}

main().catch((err) => {
  console.error('[FAIL] comments flow verify failed');
  console.error(err.message || err);
  process.exit(1);
});
