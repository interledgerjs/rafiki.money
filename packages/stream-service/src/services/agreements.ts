import { GotInstance, Response } from 'got'

export type Agreement = {
  id: string;
  assetCode: string;
  assetScale: number;
  amount: string;
  description: string;
  start: number;
  expiry: number;
  userId: string;
  accountId: string;
}

export type CreateAgreementBody = {
  asset: {
    code: string;
    scale: number;
  };
  amount: string;
  description: string;
  userId: string;
  accountId: string;
  subject: string;
}

export interface AgreementsServiceInterface {
  getAgreement(id: string): Promise<Agreement>;
  createAgreement(body: CreateAgreementBody): Promise<Agreement>;
}

export class AgreementsService implements AgreementsServiceInterface {
  constructor (private _agreementsClient: GotInstance) {
  }

  async getAgreement (id: string): Promise<Agreement> {
    return this._agreementsClient.get(`/mandates/${id}`).then((response: Response<any>) => {
      return response.body
    })
  }

  async createAgreement (body: CreateAgreementBody): Promise<Agreement> {
    return this._agreementsClient.post('/mandates', {
      json: true,
      body: body
    }).then((response: Response<any>) => {
      return response.body
    })
  }
}
