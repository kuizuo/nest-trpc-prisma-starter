import { Global, Module, Provider } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { ISecurityConfig } from '@server/config'
import { isDev } from '@server/global/env'

import { UserModule } from '../user/user.module'

import { AuthAdminController } from './auth.admin.controller'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthTrpcRouter } from './auth.trpc'
import { CaptchaModule } from './captcha/captcha.module'
import { AccountController } from './controllers/account.controller'
import { EmailController } from './controllers/email.controller'
import { TokenService } from './services/token.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

const controllers = [
  AuthController,
  AuthAdminController,
  AccountController,
  EmailController,
]
const providers: Provider[] = [
  AuthService,
  TokenService,
  AuthTrpcRouter,
]
const strategies = [LocalStrategy, JwtStrategy]

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const { jwtSecret, jwtExprire }
          = configService.get<ISecurityConfig>('security')!

        return {
          secret: jwtSecret,
          expires: jwtExprire,
          ignoreExpiration: isDev,
        }
      },
      inject: [ConfigService],
    }),
    CaptchaModule,
    UserModule,
  ],
  controllers: [...controllers],
  providers: [...providers, ...strategies],
  exports: [JwtModule, ...providers],
})
@Global()
export class AuthModule {}
