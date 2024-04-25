import { getExtendedPrismaClient } from '@server/shared/database/prisma.extension'

export const prisma = getExtendedPrismaClient({
  url: process.env.DATABASE_URL,
})
