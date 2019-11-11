import { Agreement, AgreementsServiceInterface, CreateAgreementBody } from '../../src/services/agreements'

export class MockAgreementsService implements AgreementsServiceInterface {
  async createAgreement (body: CreateAgreementBody): Promise<Agreement> {
    return {
      id: '1'
    } as Agreement
  }

  async getAgreement (id: string): Promise<Agreement> {
    return {
      id
    } as Agreement
  }
}
