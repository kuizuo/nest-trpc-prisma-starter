import { JwtService } from '@nestjs/jwt'
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'

import { TokenService } from '@server/modules/auth/services/token.service'
import { CacheService } from '@server/shared/cache/cache.service'
import { Server } from 'socket.io'

import { createAuthGateway } from '../shared/auth.gateway'

const AuthGateway = createAuthGateway({ namespace: 'web' })
@WebSocketGateway<GatewayMetadata>({ namespace: 'web' })
export class WebEventsGateway
  extends AuthGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly tokenService: TokenService,
    private readonly cacheService: CacheService,
  ) {
    super(jwtService, tokenService, cacheService)
  }

  @WebSocketServer()
  protected _server: Server

  get server() {
    return this._server
  }
}
