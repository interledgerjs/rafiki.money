import { Model } from 'objection'

export type PaymentPointerInfo = {
  id: number;
  name: string;
  identifier: string;
  userId: number;
  accountId: number;
  currentMonetizationInvoiceId: string;
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
  currentMonetizationInvoiceId !: string

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
