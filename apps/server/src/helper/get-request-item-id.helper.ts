import { FastifyRequest } from 'fastify'

export function getRequestItemId(request?: FastifyRequest): string {
  const { params = {}, body = {}, query = {} } = (request ?? {}) as any
  const id = params.id ?? body.id ?? query.id

  return id
}
