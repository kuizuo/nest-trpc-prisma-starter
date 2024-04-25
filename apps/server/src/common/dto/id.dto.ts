import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const SnowflakeIdSchema = z.string().regex(/^\d{16,19}$/)

export class IdDto extends createZodDto(
  z.object({
    id: SnowflakeIdSchema,
  }),
) {}
