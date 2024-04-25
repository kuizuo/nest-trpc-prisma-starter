import { AuthModule } from '@server/modules/auth/auth.module'
import { AuthService } from '@server/modules/auth/auth.service'
import { TodoModule } from '@server/modules/todo/todo.module'
import { createContext } from '@server/shared/trpc/trpc.context'
import { Caller } from '@server/shared/trpc/trpc.instance'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { prisma } from '@test/lib/prisma'
import { mockUserData1 } from '@test/mock/data/user.data'
import { Todo, User } from 'database'

describe('Todo', () => {
  const proxy = createE2EApp({
    imports: [TodoModule, AuthModule],
  })

  let user: User
  let todo: Todo
  let token: string
  let caller: Caller

  beforeAll(async () => {
    user = await prisma.user.create({
      data: mockUserData1,
    })

    todo = await prisma.todo.create({
      data: {
        value: 'code',
        status: false,
        userId: user.id,
      },
    })
  })

  beforeEach(async () => {
    const authService = proxy.app.get(AuthService)

    token = await authService.sign(user.id, user.role)

    const ctx = await createContext({ req: { headers: { authorization: token } } })
    caller = proxy.app.get(TRPCService).createCaller(ctx)
  })

  it('GET /todos/:id successful', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: `/todos/${todo.id}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toEqual(200)
  })

  it('TRPC todo.byId', async () => {
    const result = await caller.todo.byId({ id: todo.id })

    expect(result.id).toEqual(todo.id)
  })

  it('GET /todos/:id cannot find by other', async () => {
    const response = await proxy.app.inject({
      method: 'GET',
      url: `/todos/${todo.id}`,
      headers: {
        authorization: `Bearer ${'error_token'}`,
      },
    })
    expect(response.statusCode).toEqual(401)
  })
})
