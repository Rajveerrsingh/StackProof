// The GitHub Pages demo runs browserApi.js in the browser with a stand-in
// for jsonwebtoken. These tests run it the same way.
jest.mock('jsonwebtoken', () => require('../src/demo/jwtShim'));

const store = new Map();
global.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const { handle, resetDemo } = require('../src/demo/browserApi');

describe('static demo api', () => {
  beforeEach(async () => {
    store.clear();
    await resetDemo();
  });

  test('serves the seeded board', async () => {
    const res = await handle('GET', '/StackProof/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(5);
  });

  test('demo login works and the session survives a reload', async () => {
    const login = await handle('POST', '/api/auth/login', { email: 'sam@stackproof.dev', password: 'demo1234' });
    expect(login.status).toBe(200);
    const reloaded = await reloadModule();
    const me = await reloaded.handle('GET', '/api/auth/me', undefined, login.body.token);
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('sam');
  });

  test('uses the API validation and auth rules', async () => {
    const anon = await handle('POST', '/api/projects', { title: 'x' }, null);
    expect(anon.status).toBe(401);
    const login = await handle('POST', '/api/auth/login', { email: 'sam@stackproof.dev', password: 'demo1234' });
    const bad = await handle('POST', '/api/projects', { title: 'x' }, login.body.token);
    expect(bad.status).toBe(400);
    expect(bad.body.details.length).toBeGreaterThan(0);
  });

  test('wrong password is rejected', async () => {
    const res = await handle('POST', '/api/auth/login', { email: 'sam@stackproof.dev', password: 'nope1234' });
    expect(res.status).toBe(401);
  });
});

// Simulates a page reload: drop the in-memory copy, keep localStorage.
async function reloadModule() {
  let fresh;
  jest.isolateModules(() => {
    fresh = require('../src/demo/browserApi');
  });
  return fresh;
}
