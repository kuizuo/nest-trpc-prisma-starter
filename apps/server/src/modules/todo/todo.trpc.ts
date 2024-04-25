import { Injectable, OnModuleInit } from '@nestjs/common'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'
import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { Action } from '../casl/ability.class'

import { TodoInputSchema, TodoPagerDto } from './todo.dto'
import { TodoService } from './todo.service'

@TRPCRouter()
@Injectable()
export class TodoTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly todoService: TodoService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('todo', {
      list: this.trpcService.procedureAuth
        .input(TodoPagerDto.schema)
        .meta({ model: 'Todo', action: Action.Read })
        .query(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.todoService.list(input, user.id)
        }),
      byId: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Todo', action: Action.Read })
        .query(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.todoService.findOne(id)
        }),
      create: procedureAuth
        .input(TodoInputSchema)
        .meta({ model: 'Todo', action: Action.Create })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return this.todoService.create(input, user.id)
        }),
      update: procedureAuth
        .input(TodoInputSchema.extend({ id: z.string(), value: z.string().optional() }))
        .meta({ model: 'Todo', action: Action.Update })
        .mutation(async (opt) => {
          const { input } = opt
          const { id, ...data } = input

          return this.todoService.update(id, data)
        }),
      delete: procedureAuth
        .input(IdDto.schema)
        .meta({ model: 'Todo', action: Action.Delete })
        .mutation(async (opt) => {
          const { input } = opt
          const { id } = input

          return this.todoService.delete(id)
        }),
      batchDelete: procedureAuth
        .input(BatchDeleteDto.schema)
        .meta({ model: 'Todo', action: Action.Delete })
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt
          const { ids } = input

          return this.todoService.batchDelete(ids, user.id)
        }),
    })
  }
}
