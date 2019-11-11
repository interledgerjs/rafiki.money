import { AgreementsServiceInterface } from '../../../src/services/agreements-service'
import { Agreement } from '../../../src/types/agreement'

export class MockAgreementService implements AgreementsServiceInterface {
  addTransaction (agreementId: string, amount: number): Promise<any> {
    return Promise.resolve()
  }

  async getAgreement (id: string): Promise<Agreement> {
    return {
      id,
      accountId: '1',
      asset: {
        code: 'XRP',
        scale: 6
      },
      userId: '1',
      amount: '1200',
      callbackUrl: 'http://localhost:3004/',
      callbackAuthToken: 'testToken'
    }
  }
}
