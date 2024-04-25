import { strongPasswordSchema } from '@server/modules/user/dto/password.dto'
import { UserSchema } from 'database/zod'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class UpdateProfileDto extends createZodDto(
  UserSchema.pick({
    // username: true,
    avatar: true,
  }).partial(),
) { }

export class ResetPasswordDto extends createZodDto(z.object({
  password: strongPasswordSchema,
})) { }
