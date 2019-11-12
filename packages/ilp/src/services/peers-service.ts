import { Peer, InMemoryPeers, InMemoryPeer, PeerInfo } from '@interledger/rafiki-core'
import { Observable } from 'rxjs'

export class WalletPeersService extends InMemoryPeers {
  readonly added: Observable<Peer>
  readonly deleted: Observable<string>
  readonly updated: Observable<Peer>

  constructor (private _uplinkId: string, private _uplinkUrl: string, private _uplinkAuthToken: string) {
    super()
  }

  async get (id: string): Promise<InMemoryPeer> {
    const peerInfo: PeerInfo = id === this._uplinkId ? { id: this._uplinkId, relation: 'parent', url: this._uplinkUrl, authToken: this._uplinkAuthToken, maxPacketAmount: 40000n } : { id, relation: 'child', maxPacketAmount: 2000000n }
    return new InMemoryPeer(peerInfo)
  }
}
