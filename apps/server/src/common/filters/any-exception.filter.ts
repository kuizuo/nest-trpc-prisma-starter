import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'

import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCode, ErrorCodeEnum } from '@server/constants/error-code.constant'

import { isDev } from '@server/global/env'
import { FastifyReply, FastifyRequest } from 'fastify'

import { ResOp } from '../model/response.model'

interface myError {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor() {
    this.registerCatchAllExceptionsHook()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<FastifyRequest>()
    const response = ctx.getResponse<FastifyReply>()

    if (request.method === 'OPTIONS')
      return response.status(HttpStatus.OK).send()

    const url = request.raw.url!

    const status
      = exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status
        || (exception as myError)?.statusCode
        || HttpStatus.INTERNAL_SERVER_ERROR

    let message
      = (exception as any)?.response?.message
      || (exception as myError)?.message
      || `${exception}`

    // 系统内部错误时
    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR
      && !(exception instanceof BizException)
    ) {
      Logger.error(exception, undefined, 'Catch')

      // 生产环境下隐藏错误信息
      if (!isDev)
        message = ErrorCode[ErrorCodeEnum.ServerError]
    }
    else {
      this.logger.warn(
        `错误信息：(${status}) ${message} Path: ${decodeURI(url)}`,
      )
    }

    const errorCode: number
      = exception instanceof BizException ? exception.bizCode : status

    // 返回基础响应结果
    const resBody = new ResOp({
      code: errorCode,
      message,
      ok: false,
    })

    response.status(status).type('application/json').send(resBody)
  }

  registerCatchAllExceptionsHook() {
    process.on('unhandledRejection', (reason) => {
      console.error('unhandledRejection: ', reason)
    })

    process.on('uncaughtException', (err) => {
      console.error('uncaughtException: ', err)
    })
  }
}
