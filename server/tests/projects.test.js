const request = require('supertest');
const { createApp } = require('../src/app');
const { createMemoryRepository } = require('../src/db/memory');
const { seed } = require('../src/seed/seed');

function payload(overrides = {}) {
  return {
    title: 'Night Bus',
    summary: 'A tiny page that tells me when the last bus actually is.',
    story: 'Built it after missing the 1:10 twice.',
    tools: ['Cursor'],
    stack: ['React', 'TypeScript'],
    outcomes: { hoursSaved: 3, featuresShipped: 3, users: 2 },
    difficulty: 4,
    coverage: 5,
    githubUrl: 'https://github.com/rajveer-singh-dev/night-bus',
    shippedAt: '2026-08-01',
    ...overrides,
  };
}

async function build() {
  const repo = createMemoryRepository();
  await seed(repo);
  const api = request(createApp(repo));
  const login = await api.post('/api/auth/login').send({
    email: 'rajveer@stackproof.dev',
    password: 'demo1234',
  });
  const mina = await api.post('/api/auth/login').send({
    email: 'mina@stackproof.dev',
    password: 'demo1234',
  });
  return { api, token: login.body.token, minaToken: mina.body.token };
}

describe('projects', () => {
  test('feed cards include tools and a proof score', async () => {
    const { api } = await build();
    const res = await api.get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(5);
    const card = res.body.projects.find((p) => p.title === 'ShiftSync');
    expect(card.tools).toEqual(expect.arrayContaining(['Cursor', 'Claude Code']));
    expect(card.proof).toEqual(expect.any(Number));
    expect(card.xp).toEqual(expect.any(Number));
    expect(card.owner.username).toBe('rajveer');
    expect(card.owner.proofScore).toEqual(expect.any(Number));
  });

  test('tool filter narrows the feed', async () => {
    const { api } = await build();
    const res = await api.get('/api/projects').query({ tool: 'Claude Code' });
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
    for (const project of res.body.projects) {
      expect(project.tools.map((t) => t.toLowerCase())).toContain('claude code');
    }
  });

  test('creating a project requires a session', async () => {
    const { api } = await build();
    const res = await api.post('/api/projects').send(payload());
    expect(res.status).toBe(401);
  });

  test('bad difficulty is a 400', async () => {
    const { api, token } = await build();
    const res = await api
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(payload({ difficulty: 11 }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/form/i);
  });

  test('owner can log, edit, and delete a project', async () => {
    const { api, token, minaToken } = await build();
    const created = await api
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(payload());

    expect(created.status).toBe(201);
    expect(created.body.project.proof).toBeGreaterThan(0);
    const id = created.body.project.id;

    const blocked = await api
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${minaToken}`)
      .send(payload({ title: 'Stolen' }));
    expect(blocked.status).toBe(403);

    const updated = await api
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload({ title: 'Night Bus v2', summary: 'Now it also shows the stop across the street.' }));
    expect(updated.status).toBe(200);
    expect(updated.body.project.title).toBe('Night Bus v2');

    const removed = await api.delete(`/api/projects/${id}`).set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(204);

    const gone = await api.get(`/api/projects/${id}`);
    expect(gone.status).toBe(404);
  });
});
