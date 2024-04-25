import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { UserService } from '@server/modules/user/user.service'

import { sleep } from '@server/utils/tool.util'
import { compareSync } from 'bcrypt'
import Redis from 'ioredis'

import { LoginType, Role } from './auth.constant'
import { TokenService } from './services/token.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) { }

  async validateUser(credential: string, password: string, type: LoginType) {
    const user = type === 'account'
      ? await this.userService.getUserByUsername(credential)
      : type === 'email'
        ? await this.userService.getUserByEmail(credential)
        : null

    if (!user)
      throw new BizException(ErrorCodeEnum.PasswordMismatch)

    const isSamePassword = compareSync(password, user.password)

    if (!isSamePassword) {
      await sleep(1500)
      throw new BizException(ErrorCodeEnum.PasswordMismatch)
    }

    const { password: _p, ...result } = user
    return result
  }

  async validateToken(token: string) {
    return await this.tokenService.verifyToken(token)
  }

  async sign(
    userId: string,
    role: Role,
    otherInfo?: {
      ip: string
      ua: string
    },
  ): Promise<string> {
    const token = await this.tokenService.generateToken({ id: userId, role }, otherInfo)

    return token
  }

  async clearLoginStatus(userId: string): Promise<void> {
    await this.tokenService.removeToken(userId)
  }
}
