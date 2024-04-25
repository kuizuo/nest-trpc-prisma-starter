import { BizException } from '@server/common/exceptions/biz.exception'
import { inferRouterInputs, inferRouterOutputs, initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from './trpc.context'
import { Meta } from './trpc.meta'
import { TRPCService } from './trpc.service'

export const trpc = initTRPC.context<Context>().meta<Meta>().create({
  errorFormatter(opts) {
    const { shape, error, ctx } = opts
    let bizMessage = ''
    let code = undefined as number | undefined

    if (error.cause instanceof BizException) {
      const BizError = error.cause

      bizMessage
        = BizError.message
      code = BizError.bizCode
    }

    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        data: {},
        zodError:
          error.code === 'BAD_REQUEST'
            ? error.cause.flatten()
            : null,
      }
    }

    return {
      ...shape,
      code: code || shape.code,
      message: bizMessage || shape.message,
      data: {},
    }
  },
})

export type TRPCRouterType = (typeof trpc)['router']
export type TRPCProcedure = (typeof trpc)['procedure']
export type TRPC$Config = typeof trpc._config

export type AppRouter = TRPCService['appRouter']
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

export type Caller = TRPCService['caller']
