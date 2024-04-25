import { z } from 'zod'

import { LoginTypeEnum } from './auth.dto'

export { Role } from 'database'

export const PUBLIC_KEY = '__public_key__'

export const ROLES_KEY = '__roles_key__'

export const PERMISSION_KEY = '__permission_key__'

export const RESOURCE_KEY = '__resource_key__'

export type LoginType = z.infer<typeof LoginTypeEnum>

export const AuthStrategy = {
  LOCAL: 'local',
  LOCAL_EMAIL: 'local_email',
  LOCAL_PHONE: 'local_phone',

  JWT: 'jwt',

  GITHUB: 'github',
  GOOGLE: 'google',
} as const
