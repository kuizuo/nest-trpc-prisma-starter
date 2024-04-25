import { basePagerSchema } from '@server/common/dto/pager.dto'
import { UserOptionalDefaultsSchema } from 'database/zod'

import { createZodDto } from 'nestjs-zod'

import { z } from 'zod'

const UserInputSchema = UserOptionalDefaultsSchema
  .extend({
    username: z.string().min(4, '用户名长度过短'),
    avatar: z.string().optional(),
    email: z.string().optional(),
  })

export class UserDto extends createZodDto(UserInputSchema) { }

export class UserUpdateDto extends createZodDto(UserInputSchema.partial()) { }

export class UserQueryDto extends createZodDto(
  basePagerSchema.extend({
    keyword: z.string().optional(),
    status: z.number().optional(),
  }),
) { }
