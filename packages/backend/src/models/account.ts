import { Model } from 'objection'
import { Transaction } from './transaction'

export type AccountInfo = {
  id: number;
  userId: number;
  name: string;
  assetCode: string;
  assetScale: number;
  balance: string;
  limit: string;
}

export class Account extends Model {
  static get tableName (): string {
    return 'accounts'
  }

  static relationMappings = {
    transactions: {
      relation: Model.HasManyRelation,
      modelClass: Transaction,
      join: {
        from: 'accounts.id',
        to: 'transactions.accountId'
      }
    }
  };

  readonly id: number
  userId !: number
  name !: string
  assetCode!: string
  assetScale!: number
  balance !: bigint
  limit !: bigint

  transactions: Array<Transaction>

  $formatJson (): Partial<AccountInfo> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      balance: this.balance.toString(),
      limit: this.balance.toString()
    }
  }
}
