import { Prisma } from 'database'

export const UserSelect = {
  id: true,
  avatar: true,
} satisfies Prisma.UserSelect

export const UserProfileSelect = {
  id: true,
  username: true,
  avatar: true,
  email: true,
  role: true,
}
