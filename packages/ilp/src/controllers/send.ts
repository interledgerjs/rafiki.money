import { modifySerializedIlpPrepare, RafikiContext } from '@interledger/rafiki-core'
import axios from 'axios'

export function createSendController () {
  return async function ilpClient ({ peers: { outgoing }, request, response, accounts, state }: RafikiContext): Promise<void> {
    const incomingPrepare = request.rawPrepare
    const amount = request.prepare.amountChanged ? request.prepare.intAmount : undefined
    const expiresAt = request.prepare.expiresAtChanged ? request.prepare.expiresAt : undefined

    const outgoingPrepare = modifySerializedIlpPrepare(incomingPrepare, amount, expiresAt)
    const peer = await outgoing

    const outgoingAccounts = await accounts.outgoing

    if (outgoingAccounts.id === 'uplink') {
      response.rawReply = await peer.send(outgoingPrepare)
      return
    }

    const { callbackUrl, callbackAuthToken } = state.agreement
    if (callbackUrl) {
      const packet: Buffer = await axios.post(callbackUrl, outgoingPrepare, {
        responseType: 'arraybuffer',
        headers: {
          'content-type': 'application/octet-stream',
          authorization: `Bearer ${callbackAuthToken}`
        }
      }).then(response => response.data)
      response.rawReply = packet
    }
  }
}
