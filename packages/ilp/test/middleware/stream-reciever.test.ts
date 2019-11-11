import { IlpPrepareFactory, PeerFactory, RafikiServicesFactory } from '@interledger/rafiki-core/build/factories'
import { RafikiContext, ZeroCopyIlpPrepare } from '@interledger/rafiki-core'
import { createContext } from '@interledger/rafiki-utils'
import { createOutgoingStreamReceiverMiddleware } from '../../src/middleware/stream-reciever'
import { randomBytes } from 'crypto'
import { IlpPacketType, Packet } from 'ilp-protocol-stream/dist/src/packet'
import { generatePskEncryptionKey, generateSharedSecretFromToken, generateToken } from 'ilp-protocol-stream/dist/src/crypto'

const base64url = (buffer: Buffer) => {
  return buffer.toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

describe('Stream Receiver Middleware', function () {
  const services = RafikiServicesFactory.build()
  const alice = PeerFactory.build({ id: 'alice', maxPacketAmount: BigInt(50) })
  const bob = PeerFactory.build({ id: 'bob' })
  let ctx: any
  const severSecret = randomBytes(32)
  const middleware = createOutgoingStreamReceiverMiddleware('test.wallet.stream', severSecret)

  beforeEach(() => {
    ctx = createContext<any, RafikiContext>()
    ctx.services = services
    ctx.peers = {
      get incoming () {
        return Promise.resolve(alice)
      },
      get outgoing () {
        return Promise.resolve(bob)
      }
    }
  })

  test('Returns reply for successfully found stream token', async () => {
    const token = base64url(generateToken())
    const sharedSecret = generateSharedSecretFromToken(severSecret, Buffer.from(token, 'ascii'))
    const pskKey = await generatePskEncryptionKey(sharedSecret)
    const streamPacket = new Packet(1, IlpPacketType.Prepare)
    const encryptedPacket = await streamPacket.serializeAndEncrypt(pskKey)
    const prepare = IlpPrepareFactory.build({ destination: 'test.wallet.stream.2.' + token, amount: '49', data: encryptedPacket })
    ctx.request.prepare = new ZeroCopyIlpPrepare(prepare)
    const next = jest.fn().mockImplementation(() => {
      throw new Error('Should not hit next')
    })

    await expect(middleware(ctx, next)).resolves.toBeUndefined()
    expect(ctx.response.reply).toBeDefined()

    const { data } = ctx.response.reply
    const responsePacket = Packet.decryptAndDeserialize(pskKey, data)
  })
})
