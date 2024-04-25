import { AuthModule } from '@server/modules/auth/auth.module'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { prisma } from '@test/lib/prisma'
import { generateMockUser } from '@test/mock/data/user.data'
import { hashSync } from 'bcrypt'

describe('Account', () => {
  const proxy = createE2EApp({
    imports: [AuthModule],
  })

  it('GET /account/profile', async () => {
    const password = 'a123456'

    const { id, username } = await prisma.user.create({
      data: {
        ...generateMockUser(),
        password: hashSync(password, 8),
      },
    })

    const response = await proxy.app.inject({
      method: 'POST',
      url: '/auth/login',
      body: {
        username,
        password,
        type: 'account',
      },
    })

    const result = response.json()
    const token = result.authToken

    const data = await proxy.app.inject({
      method: 'GET',
      url: '/account/profile',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const res = data.json()

    expect(res.id).toBe(id)
    expect(res.username).toBe(username)
  })
})
