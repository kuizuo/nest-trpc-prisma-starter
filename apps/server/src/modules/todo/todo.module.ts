import { Module, Provider } from '@nestjs/common'

import { TodoAbility } from './todo.ability'
import { TodoController } from './todo.controller'
import { TodoService } from './todo.service'
import { TodoTrpcRouter } from './todo.trpc'

const providers: Provider[] = [TodoService, TodoTrpcRouter, TodoAbility]

@Module({
  controllers: [TodoController],
  providers,
  exports: [...providers],
})
export class TodoModule {}
