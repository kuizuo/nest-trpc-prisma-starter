import cluster from 'node:cluster'

import {
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'

import { fastifyApp } from './common/adapters/fastify.adapter'
import { RedisIoAdapter } from './common/adapters/socket.adapter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import type { IAppConfig } from './config'
import { DATA_DIR } from './constants/path.constant'
import { isDev, isMainProcess } from './global/env'
import { setupSwagger } from './setup-swagger'
import { MyLogger } from './shared/logger/logger.service'
import { TRPCService } from './shared/trpc/trpc.service'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
    {
      bufferLogs: true,
      snapshot: true,
    },
  )

  const configService = app.get(ConfigService)

  const { port, globalPrefix } = configService.get<IAppConfig>('app')!

  app.enableCors({ origin: '*', credentials: true })
  app.setGlobalPrefix(globalPrefix)
  app.useStaticAssets({ root: DATA_DIR })

  isDev && app.useGlobalInterceptors(new LoggingInterceptor())

  app.useWebSocketAdapter(new RedisIoAdapter(app))

  const trpc = app.get(TRPCService)
  trpc.applyMiddleware(app)

  setupSwagger(app, configService)

  await app.listen(port, '0.0.0.0', async () => {
    app.useLogger(app.get(MyLogger))
    const url = await app.getUrl()
    const { pid } = process
    const env = cluster.isPrimary
    const prefix = env ? 'P' : 'W'

    if (!isMainProcess)
      return

    const logger = new Logger('NestApplication')
    logger.log(`[${prefix + pid}] Server running on ${url}`)
    logger.log(`[${prefix + pid}] Trpc: ${url}/api/trpc-playground`)

    if (isDev)
      logger.log(`[${prefix + pid}] OpenAPI: ${url}/api-docs`)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
