const { AppError } = require('../lib/errors');
const { scoreDeveloper, toolBreakdown, FORMULA } = require('./score.service');
const { presentProject } = require('./project.service');

function sum(projects, pick) {
  return projects.reduce((total, project) => total + pick(project), 0);
}

function average(projects, pick) {
  if (!projects.length) return 0;
  const value = sum(projects, pick) / projects.length;
  return Math.round(value * 10) / 10;
}

async function getPublicProfile(repo, username) {
  const user = await repo.users.findByUsername(username);
  if (!user) throw new AppError(404, 'No developer with that username');

  const projects = await repo.projects.findByOwner(user.id);
  const scored = scoreDeveloper(projects);

  return {
    formula: FORMULA,
    profile: {
      id: user.id,
      username: user.username,
      name: user.name,
      headline: user.headline || '',
      location: user.location || '',
      bio: user.bio || '',
      createdAt: user.createdAt,
      proofScore: scored.proofScore,
      totalXp: scored.totalXp,
      parts: scored.parts,
      stats: {
        projects: projects.length,
        hoursSaved: sum(projects, (p) => p.outcomes.hoursSaved),
        featuresShipped: sum(projects, (p) => p.outcomes.featuresShipped),
        users: sum(projects, (p) => p.outcomes.users),
        avgDifficulty: average(projects, (p) => p.difficulty),
        avgCoverage: average(projects, (p) => p.coverage),
      },
      tools: toolBreakdown(projects),
      projects: projects.map((project) => presentProject(project, user, scored.proofScore)),
    },
  };
}

module.exports = { getPublicProfile };
