import { BigNumber } from 'bignumber.js'
import { FxServiceInterface } from '../../../src/services/fx-service'

const toCurrencyPair = (from: string, to: string) => {
  return from.toLowerCase() + '-' + to.toLowerCase()
}

export class MockFxService implements FxServiceInterface {
  constructor () {

  }

  async convert (from: string, to: string, fromAssetScale: number, toAssetScale: number, amount: bigint): Promise<bigint> {
    const currencyPair = toCurrencyPair(from, to)

    const rate = await this.getConversionRate(currencyPair)

    // TODO casting is not safe for other values
    const amountNumber = Number(amount)
    const convertedNumber = rate * amountNumber

    const scaleConversionFactor = new BigNumber(10).pow(toAssetScale - fromAssetScale)
    const scaledNumber = Math.floor(convertedNumber * scaleConversionFactor.toNumber())

    return BigInt(scaledNumber)
  }

  private async getConversionRate (currencyPair: string): Promise<number> {
    return 1
  }
}
