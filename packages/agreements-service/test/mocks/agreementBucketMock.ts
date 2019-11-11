import {AgreementBucketInterface} from "../../src/services/agreementBucket";
import {Agreement} from "../../src/models";

export class AgreementBucketMock implements AgreementBucketInterface {

  async getFillLevel(agreement: Agreement): Promise<number> {
    return Number(agreement.amount)
  }
  
  async take (agreement: Agreement, amount: number) {
    if (amount > Number(agreement.amount)) {
      throw new Error('Too much taken')
    }
    return
  }

}
