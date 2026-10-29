const request = require('supertest');
const { createApp } = require('../src/app');
const { createMemoryRepository } = require('../src/db/memory');
const { seed } = require('../src/seed/seed');

async function build() {
  const repo = createMemoryRepository();
  await seed(repo);
  return request(createApp(repo));
}

describe('public profile', () => {
  test('rajveer profile has the five projects, stats, and tool bars', async () => {
    const api = await build();
    const res = await api.get('/api/u/rajveer');

    expect(res.status).toBe(200);
    const { profile, formula } = res.body;
    expect(profile.name).toBe('Rajveer Singh');
    expect(profile.email).toBeUndefined();
    expect(profile.projects.map((p) => p.title).sort()).toEqual([
      'Apex',
      'Fitness Tracker API',
      'ShiftSync',
      'Sneaker Showcase',
      'TaskFlow',
    ]);
    expect(profile.proofScore).toBeGreaterThan(0);
    expect(profile.proofScore).toBeLessThanOrEqual(100);
    expect(profile.stats.projects).toBe(5);
    expect(profile.stats.hoursSaved).toBe(20 + 36 + 14 + 10 + 8);
    const cursor = profile.tools.find((row) => row.tool === 'Cursor');
    expect(cursor).toMatchObject({ count: 3, share: 75 });
    expect(formula.developer).toMatch(/proof score/);
  });

  test('unknown username is a 404', async () => {
    const api = await build();
    const res = await api.get('/api/u/nobody');
    expect(res.status).toBe(404);
  });

  test('health reports the memory store', async () => {
    const api = await build();
    const res = await api.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, store: 'memory' });
  });
});
