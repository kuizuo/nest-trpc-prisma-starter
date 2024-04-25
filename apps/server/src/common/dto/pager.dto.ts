import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { SnowflakeIdSchema } from './id.dto'

export const DEFAULT_LIMIT = 10

export const basePagerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(DEFAULT_LIMIT),
  page: z.coerce.number().int().min(1).optional().default(1),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.string()
    .or(z.enum(['asc', 'desc']))
    .optional(),

  cursor: SnowflakeIdSchema
    .or(z.null())
    .or(z.boolean())
    .transform(val => val === null || val === false || val === true ? '' : val)
    .optional(),
})

export class PagerDto extends createZodDto(basePagerSchema) { }
