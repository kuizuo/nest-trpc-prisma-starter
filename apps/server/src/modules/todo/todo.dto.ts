import { basePagerSchema } from '@server/common/dto/pager.dto'
import { TodoOptionalDefaultsSchema } from 'database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const TodoInputSchema = TodoOptionalDefaultsSchema.pick({
  value: true,
  status: true,
})

export class TodoDto extends createZodDto(TodoInputSchema) {}

export class TodoUpdateDto extends createZodDto(TodoInputSchema.partial()) {}

export class TodoPagerDto extends createZodDto(basePagerSchema.extend({
  sortBy: z.enum(['createdAt', 'updateAt']).optional(),
  // select: z.array(TodoSchema.keyof()).optional(),
})) {}
