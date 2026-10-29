const bcrypt = require('bcryptjs');

const RAJVEER_PROJECTS = [
  {
    title: 'TaskFlow',
    summary: 'A small kanban board I built so course work and applications stopped living in five different notes apps.',
    story:
      'Columns, due dates, and drag-and-drop. I actually used it for a semester: assignments on the left, applications in the middle, shipped on the right. Auth is JWT, tasks sit in MongoDB, and moving a card does not reload the page. The messy part was the drag library fighting my own state — I ended up keeping the order on the task itself and sorting on read.',
    tools: ['Claude Code', 'GitHub Copilot'],
    stack: ['React', 'Node.js', 'Express', 'MongoDB'],
    outcomes: { hoursSaved: 20, featuresShipped: 8, users: 12 },
    difficulty: 6,
    coverage: 7,
    githubUrl: 'https://github.com/rajveer-singh-dev/taskflow',
    shippedAt: '2025-11-02',
  },
  {
    title: 'ShiftSync',
    summary: 'Shift swaps for a small team, because the group chat kept losing who was covering Friday night.',
    story:
      'Staff set the hours they can work. A lead sees the week and approves a swap only when both shifts still meet minimum coverage. I built it after watching a part-time schedule get rebuilt in texts every Sunday. The overlap check is the whole product — the UI is just there so the check is obvious. TypeScript on the client saved me from mixing a shift id with a user id, which I did twice before turning it on.',
    tools: ['Cursor', 'Claude Code'],
    stack: ['React', 'TypeScript', 'Express', 'MongoDB'],
    outcomes: { hoursSaved: 36, featuresShipped: 11, users: 9 },
    difficulty: 8,
    coverage: 6,
    githubUrl: 'https://github.com/rajveer-singh-dev/shiftsync',
    shippedAt: '2026-01-18',
  },
  {
    title: 'Apex',
    summary: 'A shared study-sprint timer for exam weeks. You start a room, see who else is in, and log what you finished.',
    story:
      'Apex is deliberately small. A 25-minute timer, presence via Socket.IO, and a one-line log at the end of the sprint. No chat threads — the room is about the clock. Classmates used it during finals. Presence bugs showed up when someone refreshed mid-sprint, so the server now treats the room as the source of truth and the client just redraws it.',
    tools: ['Cursor', 'Claude Code', 'GitHub Copilot'],
    stack: ['React', 'TypeScript', 'Node.js', 'Socket.IO'],
    outcomes: { hoursSaved: 14, featuresShipped: 7, users: 21 },
    difficulty: 7,
    coverage: 5,
    githubUrl: 'https://github.com/rajveer-singh-dev/apex',
    shippedAt: '2026-03-04',
  },
  {
    title: 'Fitness Tracker API',
    summary: 'A tested REST API for workouts, sets, and personal records. No UI on purpose.',
    story:
      'Sessions, sets, and PRs. Zod checks the body on the way in. Jest covers the bits that are easy to get wrong: estimated one-rep max and weekly volume. I left the frontend off so I could talk about the API without waving at a screenshot. Four people hit it from their own scripts, which was enough to find a timezone bug in the week grouping.',
    tools: ['GitHub Copilot', 'Cursor'],
    stack: ['Node.js', 'Express', 'MongoDB', 'Jest', 'Zod'],
    outcomes: { hoursSaved: 10, featuresShipped: 10, users: 4 },
    difficulty: 6,
    coverage: 9,
    githubUrl: 'https://github.com/rajveer-singh-dev/fitness-tracker-api',
    shippedAt: '2026-04-22',
  },
  {
    title: 'Sneaker Showcase',
    summary: 'A filterable sneaker catalog. Brand, size, price, and a cart that is still there after refresh.',
    story:
      'Frontend project. The grid, the filters, and a cart in local storage. Most of the time went into the phone layout: the grid drops to one column and the filters open as a sheet instead of shoving the prices off screen. There is no checkout. I wanted browsing to feel finished before I pretended to take payments.',
    tools: ['GitHub Copilot'],
    stack: ['React', 'TypeScript', 'CSS'],
    outcomes: { hoursSaved: 8, featuresShipped: 6, users: 35 },
    difficulty: 4,
    coverage: 5,
    githubUrl: 'https://github.com/rajveer-singh-dev/sneaker-showcase',
    shippedAt: '2026-06-15',
  },
];

const MINA_PROJECTS = [
  {
    title: 'Harbor',
    summary: 'A small ferry and tide page I check before biking to the terminal.',
    story:
      'Pulls a public tide feed and shows the next few sailings in one column. I ride to the water a few times a week and got tired of three tabs. The page is boring on purpose.',
    tools: ['Claude Code'],
    stack: ['React', 'TypeScript', 'CSS'],
    outcomes: { hoursSaved: 6, featuresShipped: 5, users: 18 },
    difficulty: 5,
    coverage: 6,
    githubUrl: 'https://github.com/mina-cho/harbor',
    shippedAt: '2026-02-11',
  },
  {
    title: 'Kit List',
    summary: 'Packing lists that start from the trip, not from a blank page.',
    story:
      'Pick weekend, rain, or interview and it loads a list you can check off. Stored on the server so I can open it from my phone the night before. Nothing clever. It just stops me from forgetting a charger.',
    tools: ['Cursor', 'GitHub Copilot'],
    stack: ['React', 'Node.js', 'Express'],
    outcomes: { hoursSaved: 4, featuresShipped: 4, users: 7 },
    difficulty: 4,
    coverage: 4,
    githubUrl: 'https://github.com/mina-cho/kit-list',
    shippedAt: '2026-05-09',
  },
];

async function seed(repo) {
  const count = await repo.users.count();
  if (count > 0) return { seeded: false };

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const rajveer = await repo.users.create({
    name: 'Rajveer Singh',
    username: 'rajveer',
    email: 'rajveer@stackproof.dev',
    passwordHash,
    headline: 'Junior developer, looking for a first role in Canada',
    location: 'Canada',
    bio: 'I log what I actually shipped — the tools, the stack, and a number I can defend in an interview — instead of a skills list. Open to junior full-stack roles.',
  });

  const mina = await repo.users.create({
    name: 'Mina Cho',
    username: 'mina',
    email: 'mina@stackproof.dev',
    passwordHash,
    headline: 'Frontend developer in Vancouver',
    location: 'Vancouver, Canada',
    bio: 'I build small utilities I will actually open again. Mostly React, usually on the bus.',
  });

  for (const project of RAJVEER_PROJECTS) {
    await repo.projects.create({ ...project, ownerId: rajveer.id });
  }
  for (const project of MINA_PROJECTS) {
    await repo.projects.create({ ...project, ownerId: mina.id });
  }

  return { seeded: true, users: 2, projects: RAJVEER_PROJECTS.length + MINA_PROJECTS.length };
}

module.exports = { seed, RAJVEER_PROJECTS, MINA_PROJECTS };
