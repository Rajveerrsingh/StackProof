const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getConfig } = require('./config');
const { notFound, errorHandler } = require('./lib/errors');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const profileRoutes = require('./routes/profile.routes');

function createApp(repo) {
  const app = express();
  const { clientOrigin, isProd } = getConfig();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: isProd ? clientOrigin : true,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '256kb' }));

  app.use((req, res, next) => {
    req.repo = repo;
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, store: repo.kind });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/u', profileRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
