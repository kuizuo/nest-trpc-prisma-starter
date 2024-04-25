import { ModuleMetadata } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import * as config from '@server/config'

type ClassType<T> = new (...args: any[]) => T
export function createServiceUnitTestApp<T>(Service: ClassType<T>, module?: ModuleMetadata) {
  const proxy = {} as {
    service: T
    app: TestingModule
  }

  beforeAll(async () => {
    const { imports, providers } = module || {}
    const app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
          load: [...Object.values(config)],
        }),
        ...(imports || []),
      ],
      providers: [Service, ...(providers || [])],
    }).compile()

    await app.init()

    proxy.service = app.get<T>(Service)
    proxy.app = app
  })
  return proxy
}
