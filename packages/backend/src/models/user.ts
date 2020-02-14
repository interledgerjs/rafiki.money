import { Model } from 'objection'

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
