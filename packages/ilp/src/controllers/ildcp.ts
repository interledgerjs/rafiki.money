import { serve as ildcpServe } from 'ilp-protocol-ildcp'
import { RafikiContext } from '@interledger/rafiki-core'

export function createIldcpProtocolController (serverAddress: string) {
  return async function ildcp (ctx: RafikiContext): Promise<void> {
    const { services: { logger }, request, response } = ctx
    if (request.prepare.destination === 'peer.config') {
      const { agreement } = ctx.state

      if (agreement) {
        const clientAddress = `${serverAddress}.agreements.${ctx.state.agreement.id}`

        logger.info('responding to ILDCP request for agreement', { id: agreement.id, address: clientAddress })

        // TODO: Remove unnecessary serialization from ILDCP module
        response.rawReply = await ildcpServe({
          requestPacket: request.rawPrepare,
          handler: () => Promise.resolve({
            clientAddress,
            assetScale: agreement.asset.scale,
            assetCode: agreement.asset.code
          }),
          serverAddress
        })
      }
    } else {
      ctx.throw('Invalid address in ILDCP request')
    }
  }
}
