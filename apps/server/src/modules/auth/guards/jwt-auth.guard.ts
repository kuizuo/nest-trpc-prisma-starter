import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { ErrorCode, ErrorCodeEnum } from '@server/constants/error-code.constant'
import { AuthService } from '@server/modules/auth/auth.service'
import { FastifyRequest } from 'fastify'

import { AuthStrategy, PUBLIC_KEY } from '../auth.constant'
import { TokenService } from '../services/token.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private tokenService: TokenService,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    // const response = context.switchToHttp().getResponse<FastifyReply>()

    const Authorization = request.headers.authorization

    let result: any = false
    try {
      result = await super.canActivate(context)
    }
    catch (e) {
      // 需要后置判断 这样携带了 token 的用户就能够解析到 request.user
      if (isPublic)
        return true

      if (!Authorization)
        throw new UnauthorizedException('未登录')

      const ok = await this.tokenService.verifyToken(Authorization)
      if (!ok)
        throw new UnauthorizedException(ErrorCode[ErrorCodeEnum.JWTInvalid])
    }

    return result
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user)
      throw err || new UnauthorizedException()

    return user
  }
}
