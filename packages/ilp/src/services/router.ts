import {
  Router, SELF_PEER_ID
} from '@interledger/rafiki-core'
import { CcpRouteControlResponse, CcpRouteControlRequest, CcpRouteUpdateRequest, CcpRouteUpdateResponse } from 'ilp-protocol-ccp'

export class WalletRouter implements Router {
  constructor (private _ilpAddress: string, private _uplinkPeerId: string) {

  }

  async handleRouteControl (peerId: string, request: CcpRouteControlRequest): Promise<CcpRouteControlResponse> {
    throw new Error(`Not Implemented for ${peerId}, ${request.lastKnownRoutingTableId}`)
  }

  async handleRouteUpdate (peerId: string, request: CcpRouteUpdateRequest): Promise<CcpRouteUpdateResponse> {
    throw new Error(`Not Implemented for ${peerId}, ${request.speaker}`)
  }

  // TODO maybe need to relook at what the ILP address is?
  getAddresses (peerId: string): string[] {
    if (peerId === SELF_PEER_ID) {
      return [
        this._ilpAddress
      ]
    } else {
      return [
        this._ilpAddress + '.' + peerId
      ]
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPeerForAddress (destination: string): string {
    return this._uplinkPeerId
  }

  getRoutingTable (): {} {
    return {}
  }
}
