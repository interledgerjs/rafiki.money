import { Model } from 'objection'
import { Mandate } from './mandate'

export type MandateTransactionInfo = {
  id: number;
  accountId: number;
  amount: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  mandateId: string;
}

export class MandateTransaction extends Model {
  static get tableName (): string {
    return 'mandateTransactions'
  }

  static relationMappings = {
    account: {
      relation: Model.BelongsToOneRelation,
      modelClass: Mandate,
      join: {
        from: 'mandateTransactions.mandateId',
        to: 'mandates.id'
      }
    }
  };

  id: number;
  accountId: number;
  amount: bigint;
  description !: string;
  createdAt: string;
  updatedAt: string;
  mandateId: string;

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<MandateTransactionInfo> {
    return {
      id: this.id,
      accountId: this.accountId,
      description: this.description,
      amount: this.amount.toString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      mandateId: this.mandateId
    }
  }
}
