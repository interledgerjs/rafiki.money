import { Model } from 'objection'
import { v4 } from 'uuid'

export class BaseModel extends Model {
  constructor () {
    super()
  }

  id !: string
  createdAt !: number
  updatedAt !: number

  $beforeInsert (): void {
    this.id = v4()
    this.createdAt = Math.floor(new Date().getTime() / 1000)
    this.updatedAt = Math.floor(new Date().getTime() / 1000)
  }

  $beforeUpdate (): void {
    this.updatedAt = Math.floor(new Date().getTime() / 1000)
  }
}
