import { Model } from 'objection'

export type InvoiceInfo = {
  id: number;
  invoiceId: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export class InvoiceTransaction extends Model {
  static get tableName (): string {
    return 'invoiceTransactions'
  }

  id: number;
  invoiceId: string;
  amount: bigint;
  createdAt: string;
  updatedAt: string;

  $beforeInsert (): void {
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<InvoiceInfo> {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      amount: this.amount.toString()
    }
  }
}
