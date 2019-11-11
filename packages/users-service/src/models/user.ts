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
  createdAt !: number
  updatedAt !: number
  username !: string
  password !: string
  defaultAccountId !: string

  $beforeInsert (): void {
    this.createdAt = Math.floor(new Date().getTime() / 1000)
    this.updatedAt = Math.floor(new Date().getTime() / 1000)
  }

  $beforeUpdate (): void {
    this.updatedAt = Math.floor(new Date().getTime() / 1000)
  }

  $formatJson (): Partial<UserInfo> {
    return {
      id: this.id,
      username: this.username,
      defaultAccountId: this.defaultAccountId
    }
  }
}
