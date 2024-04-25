import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const strongPasswordSchema = z.string().refine((value) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{6,}$/
  return strongPasswordRegex.test(value)
}, { message: '密码必须包含大小写字母和数字，且长度不能小于6位' })

export class PasswordUpdateDto extends createZodDto(z.object({
  oldPassword: strongPasswordSchema,
  newPassword: strongPasswordSchema,
}).refine(data => data.oldPassword !== data.newPassword, {
  message: '新密码不能与旧密码相同',
})) {}

export class UserPasswordDto extends createZodDto(z.object({
  id: z.string(),
  password: strongPasswordSchema,
})) {}
