import { AppContext } from '../app'

export async function create (ctx: AppContext): Promise<void> {
  const { logger, stream, connectionTag } = ctx
  const { body } = ctx.request

  const data = body.data

  logger.info('Generating STREAM credentials', { connectionData: data })

  const stringData = data ? JSON.stringify(data) : ''
  const connectionTagData = connectionTag.encode(stringData)

  const { destinationAccount, sharedSecret } = stream.generateAddressAndSecret(connectionTagData)

  ctx.status = 200
  ctx.body = {
    ilpAddress: destinationAccount,
    sharedSecret: sharedSecret.toString('base64')
  }
}
