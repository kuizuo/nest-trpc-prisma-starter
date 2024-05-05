import { Injectable, OnModuleInit } from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'
import { z } from 'zod'

import { CredentialsSchema } from './auth.dto'
import { AuthService } from './auth.service'

@TRPCRouter()
@Injectable()
export class AuthTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly authService: AuthService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    const procedure = this.trpcService.procedure
    return defineTrpcRouter('auth', {
      login: procedure
        .input(CredentialsSchema)
        .mutation(async (opt) => {
          const { input } = opt
          const { username, password } = input

          // await this.captchaService.checkImgCaptcha(captchaId, verifyCode);

          const user = await this.authService.validateUser(username, password, 'account')

          if (user.role === 'Admin')
            throw new BizException(ErrorCodeEnum.PasswordMismatch)

          const jwt = await this.authService.sign(user.id, user.role)

          return {
            data: { authToken: jwt },
          }
        }),
      logout: procedureAuth
        .input(z.undefined())
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return await this.authService.clearLoginStatus(user.id)
        }),
    })
  }
}
