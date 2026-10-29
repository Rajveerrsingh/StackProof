const authService = require('../services/auth.service');
const { asyncHandler } = require('../lib/errors');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.repo, req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.repo, req.body);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.repo, req.userId);
  res.json({ user });
});

module.exports = { register, login, me };
