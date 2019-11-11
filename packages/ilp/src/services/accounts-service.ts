import {
  AccountInfo,
  AccountsService,
  AccountSnapshot,
  Transaction
} from '@interledger/rafiki-core'
import { Observable, Subject } from 'rxjs'
import { Errors } from 'ilp-packet'
import debug from 'debug'
import { map } from 'rxjs/operators'
import { AxiosInstance } from 'axios'

const { InsufficientLiquidityError } = Errors

// Implementations SHOULD use a better logger than debug for production services
const log = debug('wallet-accounts-service') // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * An in-memory account service for development and testing purposes.
 */

class WalletAccount implements AccountSnapshot {
  id: string
  peerId: string
  balancePayable: bigint
  balanceReceivable: bigint
  assetCode: string
  assetScale: number
  maximumPayable: bigint
  maximumReceivable: bigint

  constructor (id: string) {
    this.id = id
  }
}

export class WalletAccountsService implements AccountsService {
  private _updatedAccounts: Subject<AccountSnapshot>

  constructor (private _walletClient: AxiosInstance) {
  }

  get updated (): Observable<AccountSnapshot> {
    return this._updatedAccounts.asObservable().pipe(
      map(value => Object.assign({}, value))
    )
  }

  async get (id: string): Promise<WalletAccount> {
    return new WalletAccount(id)
  }

  add (accountInfo: AccountInfo): void {
    throw new Error(`Not supported for ${accountInfo.id}`)
  }

  update (accountInfo: AccountInfo): void {
    throw new Error(`Not supported for ${accountInfo.id}`)
  }

  remove (id: string): void {
    throw new Error(`Not supported for ${id}`)
  }

  // TODO needs to be implemented for outgoing and what we actually want to do with it.
  public async adjustBalancePayable (amount: bigint, accountId: string, callback: (trx: Transaction) => Promise<any>): Promise<AccountSnapshot> {
    // Need to ensure these are actually called
    const transaction: Transaction = {
      commit: async () => {
        await this.adjustAccountBalance(amount, accountId)
      },
      rollback: async () => {
      }
    }

    await callback(transaction)

    return {
      balanceReceivable: 0n,
      balancePayable: 0n
    } as AccountSnapshot
  }

  private async adjustAccountBalance (amount: bigint, accountId: string): Promise<AccountSnapshot> {
    if (accountId === 'uplink') {
      return Promise.resolve({} as AccountSnapshot)
    }
    return this._walletClient.post('transactions', {
      accountId: parseInt(accountId),
      amount: parseInt(amount.toString())
    })
  }

  // TODO there is still potentially a case where the reversal can occur twice, really need to work out a way to ensure only can happen once.
  public async adjustBalanceReceivable (amount: bigint, accountId: string, callback: (trx: Transaction) => Promise<any>): Promise<AccountSnapshot> {
    let didAdjustBalance = false

    const transaction: Transaction = {
      commit: async () => {

      },
      rollback: async () => {
        await this.adjustAccountBalance(amount, accountId)
      }
    }

    try {
      await this.adjustAccountBalance(-amount, accountId)
        .then(() => { didAdjustBalance = true })
        .catch(error => {
          log('error adjusting balance', error)
          throw new InsufficientLiquidityError('')
        })

      await callback(transaction)

      return {
        balanceReceivable: 0n,
        balancePayable: 0n
      } as AccountSnapshot
    } catch (error) {
      // Should this rethrow the the error?
      if (didAdjustBalance) { await this.adjustAccountBalance(amount, accountId) }
      throw error
    }
  }
}
