import Knex = require('knex')

export type AccountProps = {
  userId: string;
  name: string;
  assetCode: string;
  assetScale: number;
  limit: bigint;
}

export type DatabaseAccount = {
  id: string;
  userId: string;
  name: string;
  assetCode: string;
  assetScale: number;
  balance: string;
  limit: string;
}

export type Account = {
  id: string;
  userId: string;
  name: string;
  assetCode: string;
  assetScale: number;
  balance: bigint;
  limit: bigint;
}

interface AccountsService {
  add(account: AccountProps): Promise<Account>;
  update(id: string, account: AccountProps): Promise<Account>;
  delete(id: string): Promise<void>;
  get(id: string): Promise<Account>;
  getByUserId(userId: string): Promise<Array<Account>>;
}

const dbAccountToAccount = (dbAccount: DatabaseAccount): Account => {
  return {
    ...dbAccount,
    balance: BigInt(dbAccount.balance),
    limit: BigInt(dbAccount.limit)
  }
}

export class KnexAccountService implements AccountsService {
  constructor (private _knex: Knex) {

  }

  async add (account: AccountProps): Promise<Account> {
    const insertedAccountId = await this._knex<DatabaseAccount>('accounts').insert({
      userId: account.userId,
      name: account.name,
      assetCode: account.assetCode,
      assetScale: account.assetScale,
      limit: account.limit.toString(),
      balance: '0'
    }).then(result => result[0])

    const insertedAccount = await this._knex<DatabaseAccount>('accounts').where('id', insertedAccountId).first()

    if (!insertedAccount) {
      throw new Error('Error inserting account into database')
    }

    return dbAccountToAccount(insertedAccount)
  }

  async update (id: string, accountProps: AccountProps): Promise<Account> {
    await this._knex<DatabaseAccount>('accounts').where({ id }).update({
      limit: accountProps.limit.toString(),
      name: accountProps.name
    })

    const insertedAccount = await this._knex<DatabaseAccount>('accounts').where({ id }).first()

    if (!insertedAccount) {
      throw new Error('Error inserting account into database')
    }

    return dbAccountToAccount(insertedAccount)
  }

  async get (id: string): Promise<Account> {
    const account = await this._knex<DatabaseAccount>('accounts').where('id', id).first()

    if (!account) {
      throw new Error('Error inserting account into database')
    }
    return dbAccountToAccount(account)
  }

  async delete (id: string): Promise<void> {
    return undefined
  }

  async getByUserId (userId: string): Promise<Array<Account>> {
    const accounts = await this._knex<DatabaseAccount>('accounts').where({ userId })

    return accounts.map(account => {
      return dbAccountToAccount(account)
    })
  }
}
