import { Model } from 'objection'
import { Account } from './account'

export type UserInfo = {
  id: number;
  username: string;
  password: string;
  defaultAccountId: string;
}

export class User extends Model {
  static get tableName (): string {
    return 'users'
  }

  id !: number
  createdAt !: string
  updatedAt !: string
  username !: string
  password !: string
  defaultAccountId !: string

  static relationMappings = {
    accounts: {
      relation: Model.HasManyRelation,
      modelClass: Account,
      join: {
        from: 'users.id',
        to: 'accounts.userId'
      }
    }
  }

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<UserInfo> {
    return {
      id: this.id,
      username: this.username,
      defaultAccountId: this.defaultAccountId
    }
  }
}
