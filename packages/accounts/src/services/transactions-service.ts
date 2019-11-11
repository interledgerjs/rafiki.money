import { DatabaseAccount } from './accounts-service'
import Knex = require('knex')

export type Transaction = {
  accountId: string;
  amount: string;
  epoch: number;
  description: string;
}

interface TransactionsService {
  create(accountId: string, amount: bigint, description: string): Promise<void>;
  get(accountId: string, aggregateBy?: number): Promise<Array<Transaction>>;
}

export class KnexTransactionService implements TransactionsService {
  constructor (private _knex: Knex) {

  }

  async create (accountId: string, amount: bigint, description = ''): Promise<void> {
    const trx = await this._knex.transaction()
    try {
      const account = await trx<DatabaseAccount>('accounts').forUpdate()
        .where({ id: accountId }).first()

      if (!account) {
        throw new Error('Account not found')
      }

      const balance = BigInt(account.balance)
      const limit = BigInt(account.limit)
      const newBalance = balance + amount

      if (newBalance < limit) {
        throw new Error('New Balance exceeds limit')
      }

      await trx<DatabaseAccount>('accounts')
        .where({ id: accountId }).update({
          balance: newBalance.toString()
        })

      await trx<Transaction>('transactions').insert({
        accountId: account.id,
        amount: amount.toString(),
        epoch: Date.now(),
        description: description
      })

      trx.commit()
    } catch (error) {
      trx.rollback()
      throw error
    }
    return Promise.resolve()
  }

  async get (accountId: string, aggregateBy?: number): Promise<Array<Transaction>> {
    if (!aggregateBy) {
      return this._knex<Transaction>('transactions').where({ accountId })
    }

    const division = process.env.KNEX_CLIENT === 'mysql' ? `epoch DIV ${aggregateBy.toString()}` : `epoch/${parseInt(aggregateBy.toString())}`

    const t: Array<Transaction> = await this._knex<Transaction>('transactions')
      .select(this._knex.raw(`${division} as utime, sum(amount) as amount, Description as description, accountId`))
      .where({ accountId }).groupByRaw('utime, description')

    return t.map((transaction: Transaction) => {
      return {
        accountId: transaction.accountId,
        amount: transaction.amount,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        epoch: transaction.utime * aggregateBy,
        description: transaction.description
      }
    })
  }
}
