const { z } = require('zod');

const tag = z.string().trim().min(1).max(40);

const projectSchema = z.object({
  title: z.string().trim().min(2, 'Give the project a name').max(80),
  summary: z.string().trim().min(12, 'Say a bit more — at least a sentence').max(320),
  story: z.string().trim().max(4000).optional().default(''),
  tools: z.array(tag).min(1, 'Add at least one tool').max(8),
  stack: z.array(tag).min(1, 'Add at least one stack tag').max(12),
  outcomes: z.object({
    hoursSaved: z.number().int().min(0).max(100000),
    featuresShipped: z.number().int().min(0).max(500),
    users: z.number().int().min(0).max(1000000000),
  }),
  difficulty: z.number().int().min(1).max(10),
  coverage: z.number().int().min(1).max(10),
  githubUrl: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), 'Enter a full http(s) link')
    .optional()
    .default(''),
  shippedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a ship date'),
});

module.exports = { projectSchema };
