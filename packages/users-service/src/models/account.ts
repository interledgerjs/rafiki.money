import { Model } from 'objection'

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

  id !: number
  userId !: number
  name !: string
  assetCode! : string
  assetScale! : number
  balance !: bigint
  limit !: bigint

  $formatJson (): Partial<AccountInfo> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      balance: this.balance.toString(),
      limit: this.balance.toString(),
    }
  }
}
