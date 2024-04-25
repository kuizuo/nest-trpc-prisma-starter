import { Global, Module, Provider } from '@nestjs/common'

import { UserModule } from '@server/modules/user/user.module'

import { AuthModule } from '../modules/auth/auth.module'

import { AdminEventsGateway } from './events/admin.gateway'
import { WebEventsGateway } from './events/web.gateway'

const providers: Provider[] = [AdminEventsGateway, WebEventsGateway]

@Global()
@Module({
  imports: [UserModule, AuthModule],
  providers,
  exports: [...providers],
})
export class SocketModule {}
