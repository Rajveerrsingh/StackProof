const projectService = require('../services/project.service');
const { asyncHandler } = require('../lib/errors');

const list = asyncHandler(async (req, res) => {
  const result = await projectService.list(req.repo, req.query);
  res.json(result);
});

const getOne = asyncHandler(async (req, res) => {
  const project = await projectService.getById(req.repo, req.params.id);
  res.json({ project });
});

const create = asyncHandler(async (req, res) => {
  const project = await projectService.create(req.repo, req.userId, req.body);
  res.status(201).json({ project });
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.update(req.repo, req.userId, req.params.id, req.body);
  res.json({ project });
});

const remove = asyncHandler(async (req, res) => {
  await projectService.remove(req.repo, req.userId, req.params.id);
  res.status(204).end();
});

module.exports = { list, getOne, create, update, remove };
