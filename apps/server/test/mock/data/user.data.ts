import { Role } from '@server/modules/auth/auth.constant'
import { snowflake } from '@server/shared/database/snowflake.util'
import { UserOptionalDefaults } from 'database/zod'

export function generateMockUser(): UserOptionalDefaults {
  const id = snowflake.nextId()
  return {
    username: `mockUser_${id}`,
    avatar: `https://picsum.photos/200/200`,
    password: 'mockPassword123',
    email: `mockuser_${id}@example.com`,
    role: Role.User,
  }
}

const mockUserData1 = generateMockUser()

export { mockUserData1 }
