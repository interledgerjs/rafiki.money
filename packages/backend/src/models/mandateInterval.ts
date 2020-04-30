import { Model } from 'objection'
import { Mandate } from './mandate'

export type MandateTransactionInfo = {
  id: number;
  mandateId: string;
  used: string;
  startAt: string
}

export class MandateInterval extends Model {
  static get tableName (): string {
    return 'mandateIntervals'
  }

  static relationMappings = {
    mandate: {
      relation: Model.BelongsToOneRelation,
      modelClass: Mandate,
      join: {
        from: 'mandateIntervals.mandateId',
        to: 'mandates.id'
      }
    }
  };

  id: number;
  mandateId: string;
  used: bigint;
  startAt: string;
  createdAt: string;
  updatedAt: string;

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
    this.used = 0n
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<MandateTransactionInfo> {
    return {
      id: this.id,
      mandateId: this.mandateId,
      used: this.used.toString(),
      startAt: this.createdAt
    }
  }
}
