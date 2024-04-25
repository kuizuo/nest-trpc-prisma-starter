import { omit } from 'lodash'

type DefaultKeys = 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'

export const defaultProjectKeys = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'userId',
] as const

type Projection<K extends string | number | symbol> = {
  [P in K]: true
}

export const defaultSchemaOmit = Object.fromEntries(defaultProjectKeys.map(key => [key, true])) as Projection<typeof defaultProjectKeys[number]>

export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  withDefaults: true,
): Projection<K | DefaultKeys> & {
  keys: (K | DefaultKeys)[]
  serialize: <T extends object>(obj: T) => Omit<T, K | DefaultKeys>
}
export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Projection<K> & {
  keys: K[]
  serialize: <T extends object>(obj: T) => Omit<T, K>
}

export function createProjectionOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
  withDefaults: boolean = false,
): any {
  const projection: Partial<Projection<K | DefaultKeys>> = {}

  // Add default keys if withDefaults is true
  if (withDefaults) {
    defaultProjectKeys.forEach((key) => {
      projection[key] = true
    })
  }

  // Add specified keys
  for (const key of keys)
    projection[key] = true

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  projection.keys = [...keys, ...(withDefaults ? defaultProjectKeys : [])]
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  projection.serialize = (obj: T) => {
    return omit(obj, [...keys, ...(withDefaults ? defaultProjectKeys : [])])
  }

  return projection as any
}
