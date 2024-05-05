import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { Role } from 'database'
import Redis from 'ioredis'

import { UserSearchDto } from './dto/search.dto'
import { UserSelect } from './user.constant'

@Injectable()
export class UserPublicService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
  ) { }

  async getUserById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        ...UserSelect,
      },
    }).catch(resourceNotFoundWrapper(
      new BizException(ErrorCodeEnum.UserNotFound),
    ))
  }

  async getUserByIds(ids: string[]) {
    return await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        ...UserSelect,
      },
    })
  }

  async search(dto: UserSearchDto) {
    const { keyword, cursor, limit, sortBy = 'createdAt', sortOrder = 'desc' } = dto

    const [items, meta] = await this.prisma.user.paginate({
      where: {
        username: { contains: keyword },
        role: Role.User,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }).withCursor({
      limit,
      after: cursor,
    })

    return {
      items,
      meta,
    }
  }
}
