const profileService = require('../services/profile.service');
const { asyncHandler } = require('../lib/errors');

const show = asyncHandler(async (req, res) => {
  const result = await profileService.getPublicProfile(req.repo, req.params.username);
  res.json(result);
});

module.exports = { show };
