import { TRPC_ROUTER } from './trpc.constant'

export function TRPCRouter(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(TRPC_ROUTER, true, target)
  }
}
