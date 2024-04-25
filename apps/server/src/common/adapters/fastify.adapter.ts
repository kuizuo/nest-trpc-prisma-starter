import FastifyCookie from '@fastify/cookie'
import FastifyMultipart from '@fastify/multipart'
import { FastifyAdapter } from '@nestjs/platform-fastify'

const app: FastifyAdapter = new FastifyAdapter({
  trustProxy: true,
  logger: false,
})
export { app as fastifyApp }

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
app.register(FastifyMultipart, {
  limits: {
    fields: 10, // Max number of non-file fields
    fileSize: 1024 * 1024 * 20, // limit size 20M
    files: 10, // Max number of file fields
  },
})

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
app.register(FastifyCookie, {
  secret: 'cookie-secret', // 这个 secret 不太重要，不存鉴权相关，无关紧要
})

app.getInstance().addHook('onRequest', (request, reply, done) => {
  // set undefined origin
  const { origin } = request.headers
  if (!origin)
    request.headers.origin = request.headers.host

  ;(reply as any).setHeader = function (key, value) {
    return this.raw.setHeader(key, value)
  }
  ;(reply as any).end = function () {
    this.raw.end()
  }
  ;(request as any).res = reply

  // forbidden php

  const { url } = request

  if (url.endsWith('.php')) {
    reply.raw.statusMessage
      = 'Eh. PHP is not support on this machine. Yep, I also think PHP is bestest programming language. But for me it is beyond my reach.'

    return reply.code(418).send()
  }

  // skip favicon request
  if (url.match(/favicon.ico$/) || url.match(/manifest.json$/))
    return reply.code(204).send()

  done()
})
