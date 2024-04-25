import type { ExecutionContext } from '@nestjs/common'

import { createParamDecorator } from '@nestjs/common'
import { getIp } from '@server/utils/ip.util'
import type { FastifyRequest } from 'fastify'

/**
 * 快速获取 IP
 */
export const Ip = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>()
  return getIp(request)
})

/**
 * 快速获取request path，并不包括url params
 */
export const Uri = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>()
  return request.routerPath
})

/**
 * 快速获取 cookies
 */
export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>()
  return data ? request.cookies?.[data] : request.cookies
})
