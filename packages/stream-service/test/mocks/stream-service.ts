import { SPSPResponse, StreamServiceInterface } from '../../src/services/stream'

export class MockStreamService implements StreamServiceInterface {
  async payment (amount: string, destinationAccount: string, sharedSecret: string): Promise<any> {
    return Promise.resolve()
  }

  async queryPaymentPointer (id: string): Promise<SPSPResponse> {
    return {
      destinationAccount: 'test.wallet',
      sharedSecret: Buffer.alloc(32).toString('base64')
    }
  }
}
