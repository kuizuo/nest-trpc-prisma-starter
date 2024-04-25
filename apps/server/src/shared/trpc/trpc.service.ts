import { nextTick } from 'node:process'

import { subject } from '@casl/ability'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, Reflector } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { AuthService } from '@server/modules/auth/auth.service'
import { AbilityService } from '@server/modules/casl/casl.service'
import { fastifyRequestHandler } from '@trpc/server/adapters/fastify'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getFastifyPlugin } from 'trpc-playground/handlers/fastify'

import { ExtendedPrismaClient, InjectPrismaClient } from '../database/prisma.extension'

import { TRPC_ROUTER } from './trpc.constant'
import { createContext } from './trpc.context'
import { trpc } from './trpc.instance'
import { TRPCRouters } from './trpc.routes'

interface TA {
  router: any
}

type ExtractRouterType<T extends TA> = T['router']

type MapToRouterType<T extends any[]> = {
  [K in keyof T]: ExtractRouterType<T[K]>
}

type Routers = MapToRouterType<TRPCRouters>

@Injectable()
export class TRPCService implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly abilityService: AbilityService,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
  ) {
    this.logger = new Logger('TRPCService')

    this._procedureAuth = trpc.procedure
      // auth middleware
      .use(
        trpc.middleware(async (opts) => {
          const authorization = opts.ctx.req.headers?.authorization
          if (!authorization)
            throw new BizException(ErrorCodeEnum.AuthFail)

          const result = await authService.validateToken(authorization)
          if (!result)
            throw new BizException(ErrorCodeEnum.JWTInvalid)

          opts.ctx.user = result

          return opts.next()
        }),
      )
      // police middleware
      .use(trpc.middleware(async (opts) => {
        const { rawInput, ctx: { user }, meta } = opts

        if (meta) {
          const { action, model } = meta
          const ability = this.abilityService.abilityMap[model].createForUser(user)

          const id = (rawInput as { id: string }).id

          if (id) {
            const item = await this.prisma[model].findUniqueOrThrow({
              where: { id },
            })

            const result = ability.can(action, subject(model, item))
            if (!result)
              throw new BizException(ErrorCodeEnum.ResourceNotFound)
          }

          const result = ability.can(action, model)
          if (!result)
            throw new BizException(ErrorCodeEnum.NoPermission)
        }

        return opts.next()
      }))
  }

  public get trpc() {
    return trpc
  }

  public get t() {
    return trpc
  }

  private _procedureAuth: typeof trpc.procedure

  public get procedureAuth() {
    return this._procedureAuth
  }

  public get procedure() {
    return trpc.procedure
  }

  public get createCaller() {
    return trpc.createCallerFactory(this.appRouter)
  }

  caller: ReturnType<typeof this.createCaller>

  onModuleInit() {
    this.createAppRouter()
  }

  private logger: Logger
  appRouter: ReturnType<typeof this.createAppRouter>

  private createAppRouter() {
    const providers = this.discovery.getProviders()
    const routers = providers
      .filter((provider) => {
        try {
          return this.reflector.get(TRPC_ROUTER, provider.metatype)
        }
        catch {
          return false
        }
      })
      .map(({ instance }) => instance.router)
      .filter((router) => {
        if (!router)
          this.logger.warn('missing router.')

        return !!router
      })

    const appRouter = trpc.mergeRouters(...(routers as any as Routers))
    this.appRouter = appRouter
    return appRouter
  }

  applyMiddleware(_app: NestFastifyApplication) {
    _app.getHttpAdapter().all(`/api/trpc/:path`, async (req, res) => {
      const path = (req.params as any).path
      await fastifyRequestHandler({

        router: this.appRouter,
        createContext,
        req: req as unknown as FastifyRequest,
        res: res as unknown as FastifyReply,
        path,
        onError: (opts) => {
          const { error, type, path, input, ctx, req } = opts

          this.logger.error(`Error in tRPC handler on path '${path}: ${error.message}`, error.stack)
        },
      })
    })

    nextTick(async () => {
      _app.register(
        await getFastifyPlugin({
          router: this.appRouter,
          trpcApiEndpoint: '/api/trpc',
          playgroundEndpoint: '/api/trpc-playground',
        }) as any,
        { prefix: '/api/trpc-playground' },
      )
    })
  }
}
