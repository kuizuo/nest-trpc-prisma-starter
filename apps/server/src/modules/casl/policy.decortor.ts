import { SetMetadata } from '@nestjs/common'

import { ModelName } from '@server/shared/database/prisma.extension'

import { Action } from './ability.class'

export const CHECK_POLICY_KEY = '__check_policy_key__'

// eslint-disable-next-line ts/consistent-type-definitions
export type PolicyObject = { action: Action, model: ModelName }

export function Policy(policy: PolicyObject) {
  return SetMetadata(CHECK_POLICY_KEY, policy)
}
