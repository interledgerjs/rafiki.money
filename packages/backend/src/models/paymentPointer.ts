import { Model } from 'objection'

export type PaymentPointerInfo = {
  id: number;
  name: string;
  userId: number;
  accountId: number;
}

export class PaymentPointer extends Model {
  static get tableName (): string {
    return 'paymentPointers'
  }

  readonly id: number
  name !: string
  accountId !: number
  userId !: number

  $formatJson (): Partial<PaymentPointerInfo> {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      accountId: this.accountId
    }
  }
}
