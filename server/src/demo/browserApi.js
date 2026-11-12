/**
 * Demo mode for the static build (GitHub Pages).
 *
 * Pages cannot run Express, so the client calls handle() instead of fetch.
 * It goes through the same Zod schemas and services as the API, on the
 * in-memory repository, and saves a snapshot to localStorage. Passwords are
 * still bcrypt hashed. The session token is NOT a signed JWT here (see
 * demo/jwtShim.js), so this mode is for looking around, not for security.
 */
const { createMemoryRepository } = require('../db/memory');
const { seed } = require('../seed/seed');
const { AppError } = require('../lib/errors');
const { registerSchema, loginSchema } = require('../validators/auth.schema');
const { projectSchema } = require('../validators/project.schema');
const authService = require('../services/auth.service');
const projectService = require('../services/project.service');
const profileService = require('../services/profile.service');
const jwt = require('jsonwebtoken');

const KEY = 'stackproof_demo_data';
let ready;

async function setup() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    saved = null;
  }
  const repo = createMemoryRepository(saved || {});
  if (!saved) {
    await seed(repo);
    save(repo);
  }
  return repo;
}

function save(repo) {
  try {
    localStorage.setItem(KEY, JSON.stringify(repo.snapshot()));
  } catch {
    // Private mode can block storage. The demo still works for this tab.
  }
}

function body(schema, input) {
  const parsed = schema.safeParse(input || {});
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      path: issue.path.join('.') || 'body',
      message: issue.message,
    }));
    throw new AppError(400, 'Check the form and try again', details);
  }
  return parsed.data;
}

function userId(token) {
  if (!token) throw new AppError(401, 'Sign in to continue');
  try {
    return jwt.verify(token).sub;
  } catch {
    throw new AppError(401, 'Session expired, sign in again');
  }
}

async function resetDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  ready = setup();
  await ready;
}

/** Same paths and response shapes as server/src/app.js. */
async function handle(method, url, input, token) {
  ready = ready || setup();
  const repo = await ready;
  const { pathname, searchParams } = new URL(url, 'http://demo.local');
  const path = pathname.replace(/^.*\/api/, '/api');
  const projectId = (path.match(/^\/api\/projects\/([^/]+)$/) || [])[1];
  const username = (path.match(/^\/api\/u\/([^/]+)$/) || [])[1];

  try {
    let result;
    if (method === 'GET' && path === '/api/health') result = [200, { ok: true, store: 'demo' }];
    else if (method === 'POST' && path === '/api/auth/register') {
      result = [201, await authService.register(repo, body(registerSchema, input))];
    } else if (method === 'POST' && path === '/api/auth/login') {
      result = [200, await authService.login(repo, body(loginSchema, input))];
    } else if (method === 'GET' && path === '/api/auth/me') {
      result = [200, { user: await authService.me(repo, userId(token)) }];
    } else if (method === 'GET' && path === '/api/projects') {
      result = [200, await projectService.list(repo, Object.fromEntries(searchParams))];
    } else if (method === 'GET' && projectId) {
      result = [200, { project: await projectService.getById(repo, projectId) }];
    } else if (method === 'POST' && path === '/api/projects') {
      const id = userId(token);
      result = [201, { project: await projectService.create(repo, id, body(projectSchema, input)) }];
    } else if (method === 'PUT' && projectId) {
      const id = userId(token);
      result = [200, { project: await projectService.update(repo, id, projectId, body(projectSchema, input)) }];
    } else if (method === 'DELETE' && projectId) {
      await projectService.remove(repo, userId(token), projectId);
      result = [204, null];
    } else if (method === 'GET' && username) {
      result = [200, await profileService.getPublicProfile(repo, decodeURIComponent(username))];
    } else {
      throw new AppError(404, 'That route does not exist');
    }
    if (method !== 'GET') save(repo);
    return { status: result[0], body: result[1] };
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    const out = { error: status === 500 ? 'Something broke on our side' : err.message };
    if (err.details) out.details = err.details;
    return { status, body: out };
  }
}

module.exports = { handle, resetDemo };
