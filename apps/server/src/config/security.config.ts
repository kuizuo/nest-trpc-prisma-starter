import { type ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber } from '@server/global/env'

export const SecurityConfig = registerAs('security', () => ({
  jwtSecret: env('JWT_SECRET'),
  jwtExprire: env('JWT_EXPIRE'),
  refreshSecret: env('REFRESH_TOKEN_SECRET'),
  refreshExpire: envNumber('REFRESH_TOKEN_EXPIRE'),
}))

export type ISecurityConfig = ConfigType<typeof SecurityConfig>
