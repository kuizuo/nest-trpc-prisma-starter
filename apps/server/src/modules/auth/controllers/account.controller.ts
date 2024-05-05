import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ApiSecurityAuth } from '@server/common/decorators/swagger.decorator'
import { AuthUser } from '@server/modules/auth/decorators/auth-user.decorator'
import { PasswordUpdateDto } from '@server/modules/user/dto/password.dto'

import { UpdateProfileDto } from '../../user/dto/account.dto'
import { UserService } from '../../user/user.service'
import { AuthService } from '../auth.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

@ApiTags('Account - 账户模块')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Get('profile')
  async profile(@AuthUser() user: IAuthUser) {
    return this.userService.getProfile(user.id)
  }

  @Put('profile')
  async updateProfile(
    @AuthUser() user: IAuthUser, @Body()
dto: UpdateProfileDto,
  ): Promise<void> {
    await this.userService.updateProfile(dto, user.id)
  }

  @Get('logout')
  async logout(@AuthUser() user: IAuthUser): Promise<void> {
    await this.authService.clearLoginStatus(user.id)
  }

  @Put('password')
  async password(
    @AuthUser() user: IAuthUser, @Body()
    dto: PasswordUpdateDto,
  ): Promise<void> {
    await this.userService.updatePassword(user.id, dto)
  }

  // @Get('menus')
  // async menu(@AuthUser() user: IAuthUser) {
  //   return this.authService.getMenus(user.id)
  // }

  // @Get('permissions')
  // async permissions(@AuthUser() user: IAuthUser) {
  //   return this.authService.getPermissions(user.id)
  // }
}
