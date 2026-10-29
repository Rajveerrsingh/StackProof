const request = require('supertest');
const { createApp } = require('../src/app');
const { createMemoryRepository } = require('../src/db/memory');
const { seed } = require('../src/seed/seed');

async function build(withSeed = true) {
  const repo = createMemoryRepository();
  if (withSeed) await seed(repo);
  return request(createApp(repo));
}

describe('auth', () => {
  test('demo login returns a token and hides the password', async () => {
    const api = await build();
    const res = await api.post('/api/auth/login').send({
      email: 'rajveer@stackproof.dev',
      password: 'demo1234',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.username).toBe('rajveer');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.email).toBe('rajveer@stackproof.dev');
  });

  test('wrong password is a 401', async () => {
    const api = await build();
    const res = await api.post('/api/auth/login').send({
      email: 'rajveer@stackproof.dev',
      password: 'not-the-password',
    });
    expect(res.status).toBe(401);
  });

  test('register then me', async () => {
    const api = await build(false);
    const created = await api.post('/api/auth/register').send({
      name: 'Sam Patel',
      username: 'sam_p',
      email: 'sam@example.com',
      password: 'correct-horse',
      location: 'Calgary',
    });

    expect(created.status).toBe(201);
    expect(created.body.user.username).toBe('sam_p');

    const me = await api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${created.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.name).toBe('Sam Patel');
    expect(me.body.user.passwordHash).toBeUndefined();
  });

  test('duplicate email is a 409', async () => {
    const api = await build();
    const res = await api.post('/api/auth/register').send({
      name: 'Other Raj',
      username: 'raj2',
      email: 'rajveer@stackproof.dev',
      password: 'another-pass',
    });
    expect(res.status).toBe(409);
  });

  test('short password fails validation', async () => {
    const api = await build(false);
    const res = await api.post('/api/auth/register').send({
      name: 'Sam Patel',
      username: 'sam',
      email: 'sam@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.path === 'password')).toBe(true);
  });

  test('me without a token is a 401', async () => {
    const api = await build(false);
    const res = await api.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
