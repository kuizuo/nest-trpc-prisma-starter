import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ExtendedPrismaClient, InjectPrismaClient } from '../database/prisma.extension'

@Injectable()
export class CronService {
  private logger: Logger
  constructor(
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(CronService.name)
  }
}
