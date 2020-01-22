import { BaseModel } from './baseModel'

export type InvoiceBody = {
  id: string
  description: string
  amount: string
  currencyCode: string
  balance: string
  userId: string
  deletedAt?: number
}

export class Invoice extends BaseModel {
  static get tableName(): string {
    return 'invoices'
  }

  id: string
  description: string
  amount: number
  currencyCode: string
  balance: number
  userId: string
  deletedAt: number
}