import { Model } from 'objection'
import { v4 } from 'uuid'
import { Mandate } from './mandate'
import { MandateTransaction } from './mandateTransaction'

const OpenPaymentsIssuer = 'localhost' || process.env.OPEN_PAYMENTS_ISSUER

export type ChargeInfo = {
  id: string;
  mandateId: string;
  name: string;
  invoice: string;
  mandate: string;
}

export class Charge extends Model {
  static get tableName (): string {
    return 'charges'
  }

  static relationMappings = {
    mandate: {
      relation: Model.BelongsToOneRelation,
      modelClass: Mandate,
      join: {
        from: 'charges.mandateId',
        to: 'mandates.id'
      }
    },
    mandateTransactions: {
      relation: Model.HasManyRelation,
      modelClass: MandateTransaction,
      join: {
        from: 'charges.id',
        to: 'mandateTransactions.chargeId'
      }
    }
  }

  id: string
  mandateId !: string
  invoice!: string
  createdAt !: string
  updatedAt !: string
  mandateTransactions?: MandateTransaction[]

  $beforeInsert (): void {
    this.id = v4()
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<ChargeInfo> {
    return {
      id: this.id,
      name: `//${OpenPaymentsIssuer}/charges/${this.id}`,
      invoice: this.invoice,
      mandate: `//${OpenPaymentsIssuer}/mandates/${this.mandateId}`
    }
  }
}
