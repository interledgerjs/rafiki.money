import { Model } from 'objection'
import { v4 } from 'uuid'

export class SignupSession extends Model {
  static get tableName (): string {
    return 'signupSessions'
  }

  id !: string
  userId !: number
  expiresAt !: bigint

  $beforeInsert (): void {
    this.id = v4()
  }

  $formatJson () {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt
    }
  }
}
