import { UserService } from '@server/modules/user/user.service'
import { DatabaseModule } from '@server/shared/database/database.module'
import { RedisModule } from '@server/shared/redis/redis.module'
import { createServiceUnitTestApp } from '@test/helper/create-service-unit'
import { prisma } from '@test/lib/prisma'
import { generateMockUser } from '@test/mock/data/user.data'

describe('userService', () => {
  const proxy = createServiceUnitTestApp(UserService, {
    imports: [DatabaseModule, RedisModule],
  })

  it('should register user successfully', async () => {
    const userModel = generateMockUser()
    await proxy.service.register({ ...userModel })

    const user = await prisma.user.findUnique({
      where: {
        username: userModel.username,
      },
    })

    expect(user).toBeDefined()
    expect(user?.username).toBe(userModel.username)
  })

  it('should throw if existed', async () => {
    const userModel = generateMockUser()
    await proxy.service.register({ ...userModel })

    await expect(proxy.service.register({ ...userModel })).rejects.toThrowError()
  })
})
