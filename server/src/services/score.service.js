/**
 * Scoring
 * -------
 * Outcomes are self-reported. The score is a receipt, not a certificate.
 *
 * Project proof (0–100) = round(clamp(skill + outcome + evidence))
 *
 *   skill     = difficulty * 4 + coverage * 3          max 70
 *   outcome   = min(features, 12)
 *             + min(hoursSaved, 50) * 0.1
 *             + min(log10(users + 1) * 4, 6)           max 23
 *   evidence  = (github link ? 5 : 0)
 *             + min(tool count, 3) * 2                 max 11
 *
 *   Raw max is 104, then clamped to 100.
 *
 * Project XP = proof * 10
 *            + featuresShipped * 5
 *            + (coverage >= 8 ? 25 : 0)
 *            + stack length * 4
 *
 * Developer proof score (0–100), empty history is 0:
 *
 *   quality = average project proof                         weight 55%
 *   volume  = min(project count / 4, 1) * 100               weight 20%
 *   range   = min(unique tools / 4, 1) * 100                weight 15%
 *   depth   = min(unique stack tags / 8, 1) * 100           weight 10%
 *
 *   proof score = round(0.55q + 0.20v + 0.15r + 0.10d)
 *
 * Volume saturates at 4 shipped projects so one giant repo
 * cannot outrank a steady history, and a fifth project still
 * helps through quality, tools, and stack depth.
 */

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function scoreProject(project) {
  const difficulty = Number(project.difficulty) || 0;
  const coverage = Number(project.coverage) || 0;
  const features = Number(project.outcomes?.featuresShipped) || 0;
  const hours = Number(project.outcomes?.hoursSaved) || 0;
  const users = Number(project.outcomes?.users) || 0;
  const toolCount = Array.isArray(project.tools) ? project.tools.length : 0;
  const stackCount = Array.isArray(project.stack) ? project.stack.length : 0;

  const skill = difficulty * 4 + coverage * 3;
  const featurePts = Math.min(features, 12);
  const hoursPts = Math.min(hours, 50) * 0.1;
  const usersPts = Math.min(Math.log10(users + 1) * 4, 6);
  const githubPts = project.githubUrl ? 5 : 0;
  const toolPts = Math.min(toolCount, 3) * 2;

  const raw = skill + featurePts + hoursPts + usersPts + githubPts + toolPts;
  const proof = clamp(Math.round(raw), 0, 100);
  const coverageBonus = coverage >= 8 ? 25 : 0;
  const xp = proof * 10 + features * 5 + coverageBonus + stackCount * 4;

  return {
    proof,
    xp,
    breakdown: {
      skill: round1(skill),
      features: round1(featurePts),
      hours: round1(hoursPts),
      users: round1(usersPts),
      github: githubPts,
      tools: toolPts,
    },
  };
}

function scoreDeveloper(projects) {
  const list = projects || [];
  if (list.length === 0) {
    return {
      proofScore: 0,
      totalXp: 0,
      parts: { quality: 0, volume: 0, range: 0, depth: 0 },
    };
  }

  const scored = list.map(scoreProject);
  const quality = scored.reduce((sum, row) => sum + row.proof, 0) / scored.length;
  const uniqueTools = new Set(list.flatMap((p) => p.tools || [])).size;
  const uniqueStack = new Set(list.flatMap((p) => p.stack || [])).size;
  const volume = Math.min(list.length / 4, 1) * 100;
  const range = Math.min(uniqueTools / 4, 1) * 100;
  const depth = Math.min(uniqueStack / 8, 1) * 100;
  const proofScore = clamp(
    Math.round(0.55 * quality + 0.2 * volume + 0.15 * range + 0.1 * depth),
    0,
    100,
  );

  return {
    proofScore,
    totalXp: scored.reduce((sum, row) => sum + row.xp, 0),
    parts: {
      quality: round1(quality),
      volume: round1(volume),
      range: round1(range),
      depth: round1(depth),
    },
  };
}

function toolBreakdown(projects) {
  const counts = new Map();
  for (const project of projects) {
    for (const tool of project.tools || []) {
      counts.set(tool, (counts.get(tool) || 0) + 1);
    }
  }
  const rows = [...counts.entries()].map(([tool, count]) => ({ tool, count }));
  rows.sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool));
  const max = rows.reduce((m, row) => Math.max(m, row.count), 0) || 1;
  return rows.map((row) => ({
    ...row,
    share: Math.round((row.count / max) * 100),
  }));
}

const FORMULA = {
  project:
    'proof = round(clamp(difficulty*4 + coverage*3 + min(features,12) + min(hours,50)*0.1 + min(log10(users+1)*4, 6) + (github?5:0) + min(tools,3)*2))',
  xp: 'xp = proof*10 + features*5 + (coverage>=8?25:0) + stack.length*4',
  developer:
    'proof score = round(0.55*avg(project proof) + 0.20*min(count/4,1)*100 + 0.15*min(unique tools/4,1)*100 + 0.10*min(unique stack/8,1)*100)',
};

module.exports = { scoreProject, scoreDeveloper, toolBreakdown, FORMULA, clamp };
