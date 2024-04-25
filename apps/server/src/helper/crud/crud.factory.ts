import type { Type } from '@nestjs/common'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { PagerDto } from '@server/common/dto/pager.dto'
import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { AllModelNames, ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'
import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { createZodDto } from 'nestjs-zod'
import pluralize from 'pluralize'
import { z } from 'zod'

export function BaseCrudFactory<
  M extends AllModelNames,
  CDto extends z.AnyZodObject = z.AnyZodObject,
  UDto extends z.AnyZodObject = z.AnyZodObject,
>({ modelName, createSchema, updateSchema, apiPrefix }: {
  modelName: M
  createSchema: CDto
  updateSchema?: UDto
  apiPrefix?: string
}): Type<any> {
  const prefix = modelName.toLowerCase()
  const pluralizeName = pluralize(prefix) as string

  class UpdateDto extends createZodDto(updateSchema || createSchema.partial()) {}

  class CreateDto extends createZodDto(createSchema) {}

  @Controller(apiPrefix || pluralizeName)
  class BaseController {
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient

    private get db() {
      return this.prisma[modelName]
    }

    @Get()
    async list(@Query() pager: PagerDto) {
      const { page, limit } = pager
      return await this.db.paginate().withPages({
        page,
        limit,
      })
    }

    @Get('all')
    async getAll() {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.findMany()
    }

    @Get(':id')
    async get(@Param() { id }: IdDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.findUniqueOrThrow({
        where: {
          id,
        },
      })
        .catch(
          resourceNotFoundWrapper(
            new BizException(ErrorCodeEnum.ResourceNotFound),
          ),
        )
    }

    @Post()
    async create(@Body() body: CreateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.create({
        data: body,
      })
    }

    @Put(':id')
    async update(@Param() { id }: IdDto, @Body() body: UpdateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      return await this.db.update({
        where: { id },
        data: body,
      })
    }

    @Patch(':id')
    async patch(@Param() { id }: IdDto, @Body() body: UpdateDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      await this.db.update({
        where: { id },
        data: {
          ...body,
        },
      })
    }

    @Delete(':id')
    async delete(@Param() { id }: IdDto) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      await this.db.delete({ where: { id } })
    }
  }

  return BaseController
}
