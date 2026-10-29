const express = require('express');
const projectController = require('../controllers/project.controller');
const { projectSchema } = require('../validators/project.schema');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', projectController.list);
router.get('/:id', projectController.getOne);
router.post('/', requireAuth, validate(projectSchema), projectController.create);
router.put('/:id', requireAuth, validate(projectSchema), projectController.update);
router.delete('/:id', requireAuth, projectController.remove);

module.exports = router;
