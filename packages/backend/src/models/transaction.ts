import { Model } from 'objection'
import { Account } from './account'

export type TransactionInfo = {
  id: number;
  accountId: number;
  amount: bigint;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export class Transaction extends Model {
  static get tableName (): string {
    return 'transactions'
  }

  static relationMappings = {
    account: {
      relation: Model.BelongsToOneRelation,
      modelClass: Account,
      join: {
        from: 'transactions.accountId',
        to: 'accounts.id'
      }
    }
  };

  id: number;
  accountId: number;
  amount: bigint;
  description !: string;
  createdAt: string;
  updatedAt: string;

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<TransactionInfo> {
    return {
      id: this.id,
      accountId: this.accountId,
      description: this.description,
      amount: this.amount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
