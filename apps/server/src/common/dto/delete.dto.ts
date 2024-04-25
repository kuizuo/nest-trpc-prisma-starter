import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const BatchDeleteSchema = z.object({
  ids: z.array(z.string()),
})

export class BatchDeleteDto extends createZodDto(BatchDeleteSchema) {}
