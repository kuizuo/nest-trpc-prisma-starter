import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { BatchDeleteDto } from '@server/common/dto/delete.dto'

import { IdDto } from '@server/common/dto/id.dto'

import { AuthUser } from '../auth/decorators/auth-user.decorator'

import { Action } from '../casl/ability.class'
import { Policy } from '../casl/policy.decortor'
import { PolicyGuard } from '../casl/policy.guard'

import { TodoDto, TodoPagerDto, TodoUpdateDto } from './todo.dto'
import { TodoService } from './todo.service'

@ApiTags('Business - Todo模块')
@UseGuards(PolicyGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) { }

  @Get('page')
  @Policy({ model: 'Todo', action: Action.Manage })
  async list(@Query() dto: TodoPagerDto, @AuthUser() user: IAuthUser) {
    return this.todoService.paginate(dto, user.id)
  }

  @Get(':id')
  @Policy({ model: 'Todo', action: Action.Read })
  async findOne(@Param() { id }: IdDto) {
    return this.todoService.findOne(id)
  }

  @Post()
  @Policy({ model: 'Todo', action: Action.Create })
  async create(@Body() dto: TodoDto, @AuthUser() user: IAuthUser) {
    await this.todoService.create(dto, user.id)
  }

  @Put(':id')
  @Policy({ model: 'Todo', action: Action.Update })
  async update(@Param() { id }: IdDto, @Body() dto: TodoUpdateDto) {
    await this.todoService.update(id, dto)
  }

  @Delete(':id')
  @Policy({ model: 'Todo', action: Action.Delete })
  async delete(@Param() { id }: IdDto) {
    await this.todoService.delete(id)
  }

  @Delete()
  async batchDelete(@Body() dto: BatchDeleteDto, @AuthUser() user: IAuthUser) {
    const { ids } = dto
    await this.todoService.batchDelete(ids, user.id)
  }
}
