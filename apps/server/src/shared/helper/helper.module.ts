import { HttpModule } from '@nestjs/axios'
import { Global, Module, type Provider } from '@nestjs/common'

import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'

import { ThrottlerModule } from '@nestjs/throttler'

import { isDev } from '@server/global/env'

import { CronService } from './cron.service'
import { MailerModule } from './mailer/mailer.module'

const providers: Provider[] = [
  CronService,
]

@Global()
@Module({
  imports: [
    // http
    HttpModule,
    // schedule
    ScheduleModule.forRoot(),
    // rate limit
    ThrottlerModule.forRoot([
      {
        limit: 3,
        ttl: 60000,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: isDev,
      ignoreErrors: false,
    }),
    // mailer
    MailerModule,
  ],
  providers,
  exports: [MailerModule, ...providers],
})
export class HelperModule {}
