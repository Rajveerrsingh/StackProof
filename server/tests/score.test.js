const { scoreProject, scoreDeveloper, toolBreakdown } = require('../src/services/score.service');

const taskflow = {
  title: 'TaskFlow',
  difficulty: 6,
  coverage: 7,
  tools: ['Cursor', 'GitHub Copilot'],
  stack: ['React', 'Node.js', 'Express', 'MongoDB'],
  outcomes: { hoursSaved: 20, featuresShipped: 8, users: 12 },
  githubUrl: 'https://github.com/rajveer-singh-dev/taskflow',
};

describe('project proof', () => {
  test('taskflow lands on the hand-worked number', () => {
    const scored = scoreProject(taskflow);
    expect(scored.proof).toBe(68);
    expect(scored.xp).toBe(736);
    expect(scored.breakdown.github).toBe(5);
    expect(scored.breakdown.tools).toBe(4);
  });

  test('a missing github link costs the evidence points', () => {
    const withLink = scoreProject(taskflow).proof;
    const without = scoreProject({ ...taskflow, githubUrl: '' }).proof;
    expect(withLink - without).toBe(5);
  });

  test('coverage of 8 adds the xp bonus', () => {
    const low = scoreProject({ ...taskflow, coverage: 7 });
    const high = scoreProject({ ...taskflow, coverage: 8 });
    expect(high.xp - low.xp).toBeGreaterThanOrEqual(25);
  });

  test('proof stays inside 0 to 100', () => {
    const maxed = scoreProject({
      difficulty: 10,
      coverage: 10,
      tools: ['a', 'b', 'c', 'd'],
      stack: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      outcomes: { hoursSaved: 500, featuresShipped: 40, users: 100000 },
      githubUrl: 'https://github.com/example/max',
    });
    expect(maxed.proof).toBe(100);
    expect(maxed.proof).toBeLessThanOrEqual(100);
  });
});

describe('developer proof score', () => {
  test('no projects is a zero', () => {
    expect(scoreDeveloper([]).proofScore).toBe(0);
    expect(scoreDeveloper([]).totalXp).toBe(0);
  });

  test('one strong project does not saturate volume', () => {
    const one = scoreDeveloper([
      {
        difficulty: 10,
        coverage: 10,
        tools: ['Cursor', 'Claude Code', 'GitHub Copilot', 'VS Code'],
        stack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Jest', 'Zod', 'Vite'],
        outcomes: { hoursSaved: 50, featuresShipped: 12, users: 5000 },
        githubUrl: 'https://github.com/example/one',
      },
    ]);
    expect(one.parts.volume).toBe(25);
    expect(one.proofScore).toBeLessThan(100);
  });

  test('tool bars are sorted by use', () => {
    const rows = toolBreakdown([
      { tools: ['Cursor', 'Claude Code'] },
      { tools: ['Cursor'] },
    ]);
    expect(rows[0]).toMatchObject({ tool: 'Cursor', count: 2, share: 100 });
    expect(rows[1]).toMatchObject({ tool: 'Claude Code', count: 1 });
  });
});
