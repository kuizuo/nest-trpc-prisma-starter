import { ModelName } from '@server/shared/database/prisma.extension'

export const ABILITY_FACTORY_KEY = '__ABILITY_FACTORY_KEY__'

/**
 * 标识服务为 Ability
 * @param model
 * @returns
 */
export function DefineAbility(model: ModelName): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ABILITY_FACTORY_KEY, model, target)
  }
}
