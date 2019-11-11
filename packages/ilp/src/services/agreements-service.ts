import { Agreement } from '../types/agreement'
import { AxiosInstance } from 'axios'

export interface AgreementsServiceInterface {
  getAgreement(id: string): Promise<Agreement>;
  addTransaction(agreementId: string, amount: number): Promise<any>;
}

export class AgreementsService implements AgreementsServiceInterface {
  constructor (private _agreementsClient: AxiosInstance) {
  }

  async getAgreement (id: string): Promise<Agreement> {
    return this._agreementsClient.get(`/mandates/${id}`).then(response => {
      return response.data
    })
  }

  async addTransaction (agreementId: string, amount: number): Promise<any> {
    await this._agreementsClient.post(`/agreements/${agreementId}/transactions`, {
      amount: amount
    })
  }
}
