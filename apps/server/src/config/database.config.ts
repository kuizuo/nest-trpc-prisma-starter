import { type ConfigType, registerAs } from '@nestjs/config'

import { env } from '@server/global/env'

const DATABASE = {
  url: env('DATABASE_URL'),
}

export const DatabaseConfig = registerAs('database', () => DATABASE)

export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>
