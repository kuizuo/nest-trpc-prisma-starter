import { HttpException, HttpStatus } from '@nestjs/common'

import { ErrorCode, ErrorCodeEnum } from '@server/constants/error-code.constant'

/**
 * 业务异常抛出
 */
export class BizException extends HttpException {
  public bizCode: ErrorCodeEnum

  constructor(message: string)
  constructor(code: ErrorCodeEnum)
  constructor(arg: any) {
    if (typeof arg == 'string') {
      const message = arg
      super(
        HttpException.createBody({
          code: ErrorCodeEnum.Default,
          message,
        }),
        HttpStatus.OK,
      )
      this.bizCode = ErrorCodeEnum.Default

      return
    }

    const code = arg as ErrorCodeEnum
    const message = ErrorCode[code]

    super(
      HttpException.createBody({
        code,
        message,
      }),
      HttpStatus.OK,
    )

    this.bizCode = code
  }
}

// export { BizException as BusinessException }
