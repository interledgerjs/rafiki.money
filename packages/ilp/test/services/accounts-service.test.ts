import { WalletAccountsService } from '../../src/services/accounts-service'
import { AxiosInstance } from 'axios'

describe('Accounts Services', () => {
  let accountService: WalletAccountsService
  let walletClient: AxiosInstance

  beforeEach(() => {
    walletClient = {
      post: jest.fn(() => Promise.resolve())
    } as unknown as AxiosInstance
    accountService = new WalletAccountsService(walletClient)
  })

  test('Calls wallet for adjusting balanceReceivable', async () => {
    await accountService.adjustBalanceReceivable(200n, '2', async ({ commit }) => {
      await commit()
    })
    expect(walletClient.post).toHaveBeenCalledTimes(1)
    expect(walletClient.post).toBeCalledWith('transactions', {
      accountId: 2,
      amount: -200
    })
  })

  test('Calls wallet to rollback transaction if packet failed', async () => {
    await accountService.adjustBalanceReceivable(200n, '2', async ({ rollback }) => {
      await rollback()
    })
    expect(walletClient.post).toHaveBeenCalledTimes(2)
    expect(walletClient.post).toBeCalledWith('transactions', {
      accountId: 2,
      amount: 200
    })
    expect(walletClient.post).toBeCalledWith('transactions', {
      accountId: 2,
      amount: -200
    })
  })

  test('Throwing an error in the transaction will reverse the wallet payment', async () => {
    await accountService.adjustBalanceReceivable(200n, '2', async ({ rollback }) => {
      throw new Error('test Error')
    }).catch(error => {})
    expect(walletClient.post).toHaveBeenCalledTimes(2)
    expect(walletClient.post).toBeCalledWith('transactions', {
      accountId: 2,
      amount: 200
    })
    expect(walletClient.post).toBeCalledWith('transactions', {
      accountId: 2,
      amount: -200
    })
  })
})
