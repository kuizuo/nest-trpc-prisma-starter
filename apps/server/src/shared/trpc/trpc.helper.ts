import { TRPCRouterType, trpc } from './trpc.instance'

type ObjWithKey<T extends string, Value> = { [K in T]: Value }

export function defineTrpcRouter<
  T extends string,
  P extends Parameters<TRPCRouterType>[0],
>(route: T, routes: P) {
  const rpcRoute = trpc.router(routes)
  return trpc.router({
    [route]: rpcRoute,
  } as any as ObjWithKey<T, typeof rpcRoute>)
}
