import { Model } from 'objection'

export type PaymentPointerInfo = {
  id: number;
  name: string;
  identifier: string;
  userId: number;
  accountId: number;
  currentMonetizationInvoiceId: number;
}

export class PaymentPointer extends Model {
  static get tableName (): string {
    return 'paymentPointers'
  }

  readonly id: number
  name: string
  identifier: string
  userId !: number
  accountId !: number
  currentMonetizationInvoiceId !: number

  $formatJson (): Partial<PaymentPointerInfo> {
    return {
      id: this.id,
      name: this.name,
      identifier: this.identifier,
      userId: this.userId,
      accountId: this.accountId
    }
  }
}
