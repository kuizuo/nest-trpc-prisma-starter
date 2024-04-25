import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'

import { Role } from '@server/modules/auth/auth.constant'

import { Action, AppAbility, BaseAbility } from '../casl/ability.class'
import { DefineAbility } from '../casl/ability.decorator'

@DefineAbility('User')
@Injectable()
export class UserAbility implements BaseAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.role === Role.Admin)
      can(Action.Manage, 'User')

    return build()
  }
}
