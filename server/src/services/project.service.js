const { AppError } = require('../lib/errors');
const { scoreProject, scoreDeveloper } = require('./score.service');

function presentProject(project, owner, ownerScore) {
  const scored = scoreProject(project);
  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    story: project.story || '',
    tools: project.tools,
    stack: project.stack,
    outcomes: project.outcomes,
    difficulty: project.difficulty,
    coverage: project.coverage,
    githubUrl: project.githubUrl || '',
    shippedAt: project.shippedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    ownerId: project.ownerId,
    proof: scored.proof,
    xp: scored.xp,
    breakdown: scored.breakdown,
    owner: owner
      ? {
          id: owner.id,
          username: owner.username,
          name: owner.name,
          proofScore: ownerScore,
        }
      : null,
  };
}

async function ownerMap(repo, projects) {
  const ids = [...new Set(projects.map((p) => p.ownerId))];
  const users = await Promise.all(ids.map((id) => repo.users.findById(id)));
  const map = new Map();
  for (const user of users) {
    if (!user) continue;
    const owned = await repo.projects.findByOwner(user.id);
    map.set(user.id, { user, proofScore: scoreDeveloper(owned).proofScore });
  }
  return map;
}

async function list(repo, query) {
  let projects = await repo.projects.list();
  const q = String(query.q || '').trim().toLowerCase();
  const tool = String(query.tool || '').trim().toLowerCase();

  if (q) {
    projects = projects.filter((p) => {
      const blob = `${p.title} ${p.summary} ${p.stack.join(' ')} ${p.tools.join(' ')}`.toLowerCase();
      return blob.includes(q);
    });
  }
  if (tool) {
    projects = projects.filter((p) => p.tools.some((t) => t.toLowerCase() === tool));
  }

  const owners = await ownerMap(repo, projects);
  const all = await repo.projects.list();
  const tools = [...new Set(all.flatMap((p) => p.tools))].sort((a, b) => a.localeCompare(b));

  return {
    tools,
    projects: projects.map((project) => {
      const entry = owners.get(project.ownerId);
      return presentProject(project, entry?.user, entry?.proofScore ?? 0);
    }),
  };
}

async function getById(repo, id) {
  const project = await repo.projects.findById(id);
  if (!project) throw new AppError(404, 'No project with that id');
  const owner = await repo.users.findById(project.ownerId);
  const owned = owner ? await repo.projects.findByOwner(owner.id) : [];
  const proofScore = scoreDeveloper(owned).proofScore;
  return presentProject(project, owner, proofScore);
}

function cleanTags(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function toDoc(ownerId, input) {
  return {
    ownerId,
    title: input.title,
    summary: input.summary,
    story: input.story || '',
    tools: cleanTags(input.tools),
    stack: cleanTags(input.stack),
    outcomes: input.outcomes,
    difficulty: input.difficulty,
    coverage: input.coverage,
    githubUrl: input.githubUrl || '',
    shippedAt: input.shippedAt.slice(0, 10),
  };
}

async function create(repo, ownerId, input) {
  const project = await repo.projects.create(toDoc(ownerId, input));
  return getById(repo, project.id);
}

async function update(repo, ownerId, id, input) {
  const existing = await repo.projects.findById(id);
  if (!existing) throw new AppError(404, 'No project with that id');
  if (existing.ownerId !== ownerId) throw new AppError(403, 'You can only edit your own projects');
  await repo.projects.update(id, toDoc(ownerId, input));
  return getById(repo, id);
}

async function remove(repo, ownerId, id) {
  const existing = await repo.projects.findById(id);
  if (!existing) throw new AppError(404, 'No project with that id');
  if (existing.ownerId !== ownerId) throw new AppError(403, 'You can only delete your own projects');
  await repo.projects.remove(id);
}

module.exports = { list, getById, create, update, remove, presentProject };
