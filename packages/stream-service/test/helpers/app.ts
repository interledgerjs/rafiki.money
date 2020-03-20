import { App } from '../../src/app'
import createLogger from 'pino'
import { Server as StreamServer } from 'ilp-protocol-stream'
import { StreamServerMock } from '../mocks/stream'

export type TestAppContainer = {
  port: number,
  app: App
}

const createStreamServer = (): StreamServer => {
  const server = new StreamServerMock()

  return server
}

export const createTestApp = (): TestAppContainer => {
  const logger = createLogger()

  const streamServer = createStreamServer()
  const app = new App(logger, streamServer)

  app.listen(0)
  streamServer.listen()

  return {
    app,
    port: app.getPort()
  }
}
