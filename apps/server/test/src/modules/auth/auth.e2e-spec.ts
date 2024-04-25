import { AuthModule } from '@server/modules/auth/auth.module'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { prisma } from '@test/lib/prisma'
import { generateMockUser } from '@test/mock/data/user.data'
import { hashSync } from 'bcrypt'
import { pick } from 'lodash'

describe('Auth', () => {
  const proxy = createE2EApp({
    imports: [AuthModule],
  })

  it('GET /auth/captcha/image', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: '/auth/captcha/image',
    })

    const result = response.json()
    expect(result.image).toContain('base64')
    expect(typeof result.id).toBe('string')
  })

  it('POST /auth/login', async () => {
    const password = 'password123'
    const { username } = await prisma.user.create({
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
    expect(result.authToken).toBeDefined()
  })

  it('POST /auth/register', async () => {
    const mockUser = pick(generateMockUser(), ['username', 'password'])
    const response = await proxy.app.inject({
      method: 'POST',
      url: '/auth/register',
      body: {
        ...mockUser,
        type: 'account',
      },
    })

    expect(response.statusCode).toBe(201)
  })
})
