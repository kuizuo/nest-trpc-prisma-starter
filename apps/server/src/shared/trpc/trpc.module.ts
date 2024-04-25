import { Global, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { TRPCService } from './trpc.service'

@Module({
  imports: [DiscoveryModule],
  exports: [TRPCService],
  providers: [TRPCService],
})
@Global()
export class TRPCModule {}
