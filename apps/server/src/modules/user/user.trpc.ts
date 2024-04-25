import { Injectable, OnModuleInit } from '@nestjs/common'

import { IdDto } from '@server/common/dto/id.dto'
import { TRPCRouter } from '@server/shared/trpc/trpc.decorator'
import { defineTrpcRouter } from '@server/shared/trpc/trpc.helper'
import { TRPCService } from '@server/shared/trpc/trpc.service'

import { UpdateProfileDto } from './dto/account.dto'
import { UserSearchDto } from './dto/search.dto'
import { UserPublicService } from './user.public.service'
import { UserService } from './user.service'

@TRPCRouter()
@Injectable()
export class UserTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  constructor(
    private readonly trpcService: TRPCService,
    private readonly userService: UserService,
    private readonly userPublicService: UserPublicService,
  ) { }

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth
    return defineTrpcRouter('user', {
      byId: procedureAuth
        .input(IdDto.schema)
        .query(async (opt) => {
          const { input, ctx: { user } } = opt
          const { id } = input

          return await this.userPublicService.getUserById(id)
        }),
      profile: procedureAuth.query(async (opt) => {
        const { ctx: { user } } = opt

        return await this.userService.getProfile(user.id)
      }),
      updateProfile: procedureAuth
        .input(UpdateProfileDto.schema)
        .mutation(async (opt) => {
          const { input, ctx: { user } } = opt

          return await this.userService.updateProfile(input, user.id)
        }),
    })
  }
}
