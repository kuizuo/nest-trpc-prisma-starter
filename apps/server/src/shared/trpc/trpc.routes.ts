import { AuthTrpcRouter } from '@server/modules/auth/auth.trpc'
import { TodoTrpcRouter } from '@server/modules/todo/todo.trpc'
import { UserTrpcRouter } from '@server/modules/user/user.trpc'

export type TRPCRouters = [
  AuthTrpcRouter,
  UserTrpcRouter,
  TodoTrpcRouter,
]
