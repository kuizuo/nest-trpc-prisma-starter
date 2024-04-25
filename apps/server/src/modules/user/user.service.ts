import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { AppConfig, IAppConfig } from '@server/config'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'

import { RegisterDto } from '@server/modules/auth/auth.dto'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { resourceNotFoundWrapper } from '@server/utils/prisma.util'
import { compareSync, hashSync } from 'bcrypt'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'

import { Role } from '../auth/auth.constant'

import { UpdateProfileDto } from './dto/account.dto'

import { PasswordUpdateDto } from './dto/password.dto'
import { UserDto, UserQueryDto, UserUpdateDto } from './dto/user.dto'
import { UserProfileSelect } from './user.constant'

@Injectable()
export class UserService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
    @Inject(AppConfig.KEY) private readonly appConfig: IAppConfig,
  ) { }

  async getUserById(id: string) {
    return await this.prisma.user.findUniqueOrThrow({ where: { id } })
      .catch(resourceNotFoundWrapper(new BizException(ErrorCodeEnum.UserNotFound)))
  }

  async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({ where: { username } })
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } })
  }

  async getProfile(userId: string) {
    return await this.prisma.user
      .findUniqueOrThrow({
        select: {
          ...UserProfileSelect,
        },
        where: {
          id: userId,
        },
      })
      .catch(resourceNotFoundWrapper(new BizException(ErrorCodeEnum.UserNotFound)))
  }

  async updateProfile(dto: UpdateProfileDto, userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
    })

    return user
  }

  async updatePassword(userId: string, dto: PasswordUpdateDto): Promise<void> {
    const { oldPassword, newPassword } = dto
    const user = await this.getUserById(userId)

    const isSamePassword = compareSync(oldPassword, user.password)

    // 原密码不一致，不允许更改
    if (!isSamePassword)
      throw new BizException(ErrorCodeEnum.PasswordMismatch)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashSync(newPassword, 10),
      },
    })
  }

  async forceUpdatePassword(userId: string, password: string): Promise<void> {
    const user = await this.getUserById(userId)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashSync(password, 10),
      },
    })
  }

  async create(dto: UserDto) {
    const { username, password, avatar, ...data } = dto

    const exist = await this.prisma.user.findFirst({ where: { username } })
    if (!isEmpty(exist))
      return exist

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashSync(password, 10),
        avatar: avatar ?? `${this.appConfig.baseUrl}/static/avatar/default.png`,
        ...data,
        role: Role.User,
      },
    })

    return user
  }

  async update(
    id: string,
    { password, status, ...data }: UserUpdateDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      if (password)
        await this.forceUpdatePassword(id, password)

      await tx.user.update({
        where: { id },
        data: {
          ...data,
          status,
        },
      })
    })
  }

  async delete(userIds: string[]): Promise<void | never> {
    await this.prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        role: { not: Role.Admin },
      },
    })
  }

  async paginate(dto: UserQueryDto) {
    const {
      page,
      limit,
      keyword,
      status,
    } = dto

    const [items, meta] = await this.prisma.user.paginate({
      where: {
        ...(keyword && { username: { contains: keyword } }),
        ...(keyword && { email: { contains: keyword } }),
        ...(status && { status }),
      },
    }).withPages({
      page,
      limit,
      includePageCount: true,
    })

    return {
      items,
      meta,
    }
  }

  async register(dto: RegisterDto) {
    const { username, ...data } = dto
    const exists = await this.prisma.user.exists({
      where: { username },
    })

    if (exists)
      throw new BizException('系统用户已存在')

    return await this.prisma.$transaction(async (tx) => {
      const password = hashSync(data.password, 10)

      const avatar = `${this.appConfig.baseUrl}/static/avatar/default.png`

      const user = await tx.user.create({
        data: {
          ...data,
          username,
          password,
          avatar,
          status: 1,
          role: Role.User,
        },
      })

      return user
    })
  }
}
