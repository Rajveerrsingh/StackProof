const { createApp } = require('./app');
const { connectRepository } = require('./db');
const { seed } = require('./seed/seed');
const { getConfig } = require('./config');

async function main() {
  const { port, jwtSecret, isProd } = getConfig();
  if (isProd && jwtSecret === 'dev-only-stackproof-secret') {
    console.warn('JWT_SECRET is still the dev default');
  }

  const repo = await connectRepository();
  const result = await seed(repo);
  if (result.seeded) {
    console.log(`Seeded ${result.users} developers and ${result.projects} projects`);
  }

  const app = createApp(repo);
  app.listen(port, '0.0.0.0', () => {
    console.log(`StackProof API on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
