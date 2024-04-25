import type { INestApplication } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { patchNestJsSwagger } from 'nestjs-zod'

import { API_SECURITY_AUTH } from './common/decorators/swagger.decorator'
import { ResOp } from './common/model/response.model'
import type { IAppConfig } from './config'
import { isDev } from './global/env'

patchNestJsSwagger()

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  const { name, port } = configService.get<IAppConfig>('app')!

  if (!isDev)
    return

  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .setDescription(`${name} API document`)
    .setVersion('1.0')

  // auth security
  documentBuilder.addSecurity(API_SECURITY_AUTH, {
    description: 'Auth',
    type: 'apiKey',
    in: 'header',
    name: 'Authorization',
  })

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    ignoreGlobalPrefix: false,
    extraModels: [ResOp],
  })

  SwaggerModule.setup('api-docs', app, document)

  // started log
  const logger = new Logger('SwaggerModule')
  logger.log(`Document running on http://127.0.0.1:${port}/api-docs`)
}
