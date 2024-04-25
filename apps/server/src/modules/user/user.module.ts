import { Module, Provider } from '@nestjs/common'

import { UserAbility } from './user.ability'
import { UserController } from './user.controller'
import { UserPublicService } from './user.public.service'
import { UserService } from './user.service'
import { UserTrpcRouter } from './user.trpc'

const providers: Provider[] = [
  UserService,
  UserPublicService,
  UserTrpcRouter,
  UserAbility,
]

@Module({
  imports: [
  ],
  controllers: [UserController],
  providers,
  exports: providers,
})
export class UserModule { }
