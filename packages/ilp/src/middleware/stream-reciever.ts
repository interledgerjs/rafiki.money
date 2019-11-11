import { RafikiContext, RafikiPrepare } from '@interledger/rafiki-core'
import {
  decrypt,
  generateFulfillment, generateFulfillmentKey,
  generatePskEncryptionKey,
  generateSharedSecretFromToken, hash
} from 'ilp-protocol-stream/dist/src/crypto'
import { IlpReply } from 'ilp-packet'
import { Frame, FrameType, IlpPacketType, Packet, StreamMaxMoneyFrame } from 'ilp-protocol-stream/dist/src/packet'

const handlePacket = async (prepare: RafikiPrepare, pskKey: Buffer, sharedSecret: Buffer): Promise<IlpReply> => {
  const fulfillmentKey = await generateFulfillmentKey(sharedSecret)
  const fulfillment = await generateFulfillment(fulfillmentKey, prepare.data)
  const generatedCondition = await hash(fulfillment)

  let requestPacket: Packet
  try {
    requestPacket = await Packet.decryptAndDeserialize(pskKey, prepare.data)
  } catch (err) {
    throw new Error('Could not decrypt STREAM packet')
  }

  const responseFrames: Frame[] = []

  for (const frame of requestPacket.frames) {
    if (frame.type === FrameType.StreamMoney) {
      responseFrames.push(new StreamMaxMoneyFrame(frame.streamId, Math.pow(2, 53) - 1, 0))
    }
  }

  if (generatedCondition.equals(prepare.executionCondition)) {
    const responsePacket = new Packet(requestPacket.sequence, IlpPacketType.Fulfill, prepare.amount, responseFrames)
    return {
      fulfillment,
      data: await responsePacket.serializeAndEncrypt(pskKey)
    }
  } else {
    const responsePacket = new Packet(requestPacket.sequence, IlpPacketType.Reject, prepare.amount, responseFrames)
    return {
      code: 'F99',
      message: '',
      triggeredBy: prepare.destination,
      data: await responsePacket.serializeAndEncrypt(pskKey)
    }
  }
}

export function createOutgoingStreamReceiverMiddleware (ilpStreamAddress: string, serverSecret: Buffer) {
  return async ({ request, response }: RafikiContext, next: () => Promise<any>): Promise<void> => {
    const { destination, data } = request.prepare

    if (destination.startsWith(ilpStreamAddress)) {
      // Check if the packet is potentially for a stream receiver
      const localAddressParts = destination.replace(ilpStreamAddress + '.', '').split('.')

      // First part will be accountId
      // Second part will be stream specific connectionId
      const connectionId = localAddressParts[1]

      if (!connectionId) {
        throw new Error('Token not found for packet')
      }

      const token = Buffer.from(connectionId, 'ascii')
      const sharedSecret = generateSharedSecretFromToken(serverSecret, token)
      const pskKey = await generatePskEncryptionKey(sharedSecret)
      await decrypt(pskKey, data)

      response.reply = await handlePacket(request.prepare, pskKey, sharedSecret)
    } else {
      await next()
    }
  }
}
