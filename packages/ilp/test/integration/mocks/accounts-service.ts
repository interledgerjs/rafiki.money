import { AccountSnapshot, AccountsService, Transaction } from '@interledger/rafiki-core'
import { Observable } from 'rxjs'

export class MockAccountsService implements AccountsService {
  readonly updated: Observable<AccountSnapshot>

  async adjustBalancePayable (amount: bigint, accountId: string, callback: (trx: Transaction) => Promise<any>): Promise<AccountSnapshot> {
    const transaction: Transaction = {
      commit: async () => {
      },
      rollback: async () => {
      }
    }

    await callback(transaction)

    return {
      balancePayable: 0n,
      balanceReceivable: 0n
    } as AccountSnapshot
  }

  async adjustBalanceReceivable (amount: bigint, accountId: string, callback: (trx: Transaction) => Promise<any>): Promise<AccountSnapshot> {
    const transaction: Transaction = {
      commit: async () => {
      },
      rollback: async () => {
      }
    }

    await callback(transaction)

    return {
      balancePayable: 0n,
      balanceReceivable: 0n
    } as AccountSnapshot
  }

  async get (accountId: string): Promise<AccountSnapshot> {
    return {
      id: accountId,
      assetCode: 'XRP',
      assetScale: 9
    } as AccountSnapshot
  }
}
