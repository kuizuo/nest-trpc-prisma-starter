import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class ImageCaptchaDto extends createZodDto(z.object({
  width: z.number().optional().default(100),
  height: z.number().optional().default(50),
})) {}

export class SendEmailCodeDto extends createZodDto(z.object({
  email: z.string().email({ message: '邮箱格式不正确' }),
})) {}

export class SendSmsCodeDto extends createZodDto(z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
})) {}

export class CheckCodeDto extends createZodDto(z.object({
  identity: z.string(),
  code: z.string(),
})) {}
