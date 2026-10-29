const { AppError } = require('../lib/errors');

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      next(new AppError(400, 'Check the form and try again', details));
      return;
    }
    req.body = parsed.data;
    next();
  };
}

module.exports = { validate };
