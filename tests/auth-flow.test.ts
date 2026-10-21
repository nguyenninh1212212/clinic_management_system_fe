import assert from 'node:assert/strict';
import { test } from 'node:test';
import axios, { AxiosError } from 'axios';

const storage = new Map<string, string>([
  ['access_token', 'legacy-patient-token'],
  ['current_user', JSON.stringify({ id: 'patient', role: 'USER' })],
]);
Object.assign(globalThis, {
  sessionStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  window: { location: { pathname: '/login', href: '/login' } },
});
const user = (role: string, id = 'medical-1') => ({ id, email: `${id}@test.local`, fullName: id, role, accountType: role === 'USER' ? 'PATIENT' : 'STAFF' });

test('medical authentication flow', async (suite) => {
  const { authApi } = await import('../src/api/endpoints/auth.api');
  const { api } = await import('../src/api/axios');
  const { useAuthStore } = await import('../src/stores/auth.store');
  const previousAdapter = api.defaults.adapter;
  const previousRawAdapter = axios.defaults.adapter;
  try {
    await suite.test('discards legacy patient sessions on medical portal startup', () => {
      assert.equal(useAuthStore.getState().isAuthenticated, false);
      assert.equal(useAuthStore.getState().accessToken, null);
      assert.equal(storage.has('access_token'), false);
      assert.equal(storage.has('current_user'), false);
    });
    await suite.test('medical login sends identifier and password to the medical endpoint', async () => {
      api.defaults.adapter = async config => {
        assert.equal(config.url, '/auth/staff/login');
        assert.deepEqual(JSON.parse(config.data), { identifier: 'doctor@test.local', password: 'Password123' });
        return { data: { accessToken: 'token', user: user('STAFF') }, status: 200, statusText: 'OK', config, headers: {} };
      };
      const session = await authApi.login({ identifier: ' doctor@test.local ', password: 'Password123' });
      assert.equal(session.user.role, 'STAFF');
    });
    await suite.test('patient and guest responses cannot establish medical sessions', async () => {
      for (const role of ['USER', 'GUEST']) {
        api.defaults.adapter = async config => ({ data: { accessToken: 'token', user: user(role) }, status: 200, statusText: 'OK', config, headers: {} });
        await assert.rejects(authApi.login({ identifier: 'user@test.local', password: 'password' }));
        assert.throws(() => useAuthStore.getState().setAuth('token', user(role) as never));
      }
    });
    await suite.test('failed medical login never starts silent refresh', async () => {
      let refreshCalls = 0;
      axios.defaults.adapter = async () => { refreshCalls++; throw new Error('unexpected refresh'); };
      api.defaults.adapter = async config => { throw new AxiosError('Bad credentials', 'ERR_BAD_REQUEST', config, undefined, { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config }); };
      await assert.rejects(authApi.login({ identifier: 'wrong@test.local', password: 'wrong' }));
      assert.equal(refreshCalls, 0);
    });
    await suite.test('only administrators can submit medical registration', async () => {
      let requests = 0;
      api.defaults.adapter = async config => { requests++; return { data: {}, status: 201, statusText: 'Created', config, headers: {} }; };
      for (const role of ['STAFF', 'MANAGER']) {
        useAuthStore.getState().setAuth('staff-token', user(role) as never);
        await assert.rejects(authApi.register({ email: 'new@test.local', password: 'Password123', fullName: 'New Staff' }));
      }
      assert.equal(requests, 0);
      useAuthStore.getState().clearAuth();
      await assert.rejects(authApi.register({ email: 'new@test.local', password: 'Password123', fullName: 'New Staff' }));
      assert.equal(requests, 0);
    });
    await suite.test('registration keeps the administrator session and sends no role override', async () => {
      for (const role of ['ADMIN', 'SUPER_ADMIN']) {
        useAuthStore.getState().setAuth('administrator-token', user(role, 'admin') as never);
        api.defaults.adapter = async config => {
          assert.equal(config.url, '/auth/staff/register');
          assert.equal(config.headers.Authorization, 'Bearer administrator-token');
          assert.equal(JSON.parse(config.data).role, undefined);
          return { data: user('STAFF', 'new-staff'), status: 201, statusText: 'Created', config, headers: {} };
        };
        await authApi.register({ email: 'new@test.local', password: 'Password123', fullName: 'New Staff' });
        assert.equal(useAuthStore.getState().user?.id, 'admin');
        assert.equal(useAuthStore.getState().accessToken, 'administrator-token');
      }
    });
    await suite.test('refresh rejects a patient cookie and clears the local medical session', async () => {
      useAuthStore.getState().setAuth('old-token', user('ADMIN') as never);
      api.defaults.adapter = async config => { throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config }); };
      axios.defaults.adapter = async config => ({ data: config.url?.endsWith('/auth/staff/refresh') ? { accessToken: 'patient-token' } : user('USER', 'patient'), status: 200, statusText: 'OK', config, headers: {} });
      await assert.rejects(api.get('/private'));
      assert.equal(useAuthStore.getState().isAuthenticated, false);
      assert.equal(useAuthStore.getState().accessToken, null);
    });
    await suite.test('refresh replaces stale identity with the server-authenticated medical user', async () => {
      useAuthStore.getState().setAuth('old-token', user('ADMIN', 'old-admin') as never);
      let calls = 0;
      api.defaults.adapter = async config => {
        if (++calls === 1) throw new AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined, { status: 401, data: {}, statusText: 'Unauthorized', headers: {}, config });
        assert.equal(config.headers.Authorization, 'Bearer fresh-token');
        return { data: {}, status: 200, statusText: 'OK', config, headers: {} };
      };
      axios.defaults.adapter = async config => ({ data: config.url?.endsWith('/auth/staff/refresh') ? { accessToken: 'fresh-token' } : user('STAFF', 'new-staff'), status: 200, statusText: 'OK', config, headers: {} });
      await api.get('/private');
      assert.equal(useAuthStore.getState().user?.id, 'new-staff');
      assert.equal(useAuthStore.getState().user?.role, 'STAFF');
    });
  } finally {
    api.defaults.adapter = previousAdapter;
    axios.defaults.adapter = previousRawAdapter;
    useAuthStore.getState().clearAuth();
  }
});
