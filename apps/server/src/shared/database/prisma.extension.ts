import { Inject } from '@nestjs/common'
import { DEFAULT_LIMIT } from '@server/common/dto/pager.dto'
import { DatabaseConfig } from '@server/config/database.config'
import { Prisma, PrismaClient } from 'database'
import { pagination } from 'prisma-extension-pagination'

import { snowflakeGeneratorMiddleware } from './middlewares/snowflake.middleware'

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT')

export function InjectPrismaClient() {
  return Inject(PRISMA_CLIENT)
}

export function getExtendedPrismaClient({ url }: { url?: string }) {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })

  prismaClient.$use(snowflakeGeneratorMiddleware)

  const extendedPrismaClient = prismaClient.$extends({
    result: {},
    model: {
      $allModels: {
        async exists<T, A>(
          this: T,
          args: Prisma.Exact<
            A,
            Pick<Prisma.Args<T, 'findFirst'>, 'where'>
          >,
        ): Promise<boolean> {
          if (typeof args !== 'object')
            return false

          if (!('where' in args))
            return false

          const count = await (this as any).count({ where: args.where })

          return count > 0
        },
      },
    },
  }).$extends(pagination({
    cursor: {
      limit: DEFAULT_LIMIT,
      getCursor({ id }) {
        return id
      },
      parseCursor(cursor) {
        return {
          id: cursor,
        }
      },
    },
    pages: {
      limit: DEFAULT_LIMIT,
    },
  }))

  return extendedPrismaClient
}

export type ExtendedPrismaClient = ReturnType<typeof getExtendedPrismaClient>

export const extendedPrismaClient = getExtendedPrismaClient({ url: DatabaseConfig().url })

export type ModelName = Prisma.ModelName

export type AllModelNames = Prisma.TypeMap['meta']['modelProps']

export type ModelFindInput<T extends AllModelNames> = NonNullable<
  Parameters<ExtendedPrismaClient[T]['findFirst']>[0]
>

export type ModelCreateInput<T extends AllModelNames> = NonNullable<
  Parameters<ExtendedPrismaClient[T]['create']>[0]
>

export type ModelInputWhere<T extends AllModelNames> =
  ModelFindInput<T>['where']

export type ModelInputData<T extends AllModelNames> =
  ModelCreateInput<T>['data']
