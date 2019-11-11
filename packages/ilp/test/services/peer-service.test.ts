import { InMemoryPeer } from '@interledger/rafiki-core'
import { WalletPeersService } from '../../src/services/peers-service'

describe('Wallet Peer Service', function () {
  const walletPeerService = new WalletPeersService('uplink', 'http://localhost:3000/ilp', 'test-token')

  describe('get', function () {
    test('returns an In-memory peer where send is a no-op for non uplink peers', async () => {
      const peer = await walletPeerService.get('alice')

      expect(peer).toBeInstanceOf(InMemoryPeer)
      expect(peer.id).toEqual('alice')
      expect(() => peer.send(Buffer.alloc(0))).toThrowError('No send client configured for peer')
    })

    test('returns an In-memory peer which will send to specified url for uplink peer', async () => {
      const peer = await walletPeerService.get('uplink')

      expect(peer).toBeInstanceOf(InMemoryPeer)
      expect(peer.id).toEqual('uplink')
      expect(peer.url).toEqual('http://localhost:3000/ilp')
      expect(peer.authToken).toEqual('test-token')
    })
  })
})
