import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'

import { Role } from '@server/modules/auth/auth.constant'

import { Action, AppAbility, BaseAbility } from '../casl/ability.class'
import { DefineAbility } from '../casl/ability.decorator'

@DefineAbility('Todo')
@Injectable()
export class TodoAbility implements BaseAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    if (user.role === Role.Admin)
      can(Action.Manage, 'Todo')

    if (user.role === Role.User) {
      can(Action.Create, 'Todo')
      can(Action.Read, 'Todo', { userId: user.id })
      can(Action.Update, 'Todo', { userId: user.id })
      can(Action.Delete, 'Todo', { userId: user.id })
    }

    return build()
  }
}
