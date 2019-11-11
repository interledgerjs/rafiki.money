import { AxiosInstance } from 'axios'
import { BigNumber } from 'bignumber.js'

export interface FxServiceInterface {
  convert: (from: string, to: string, fromAssetScale: number, toAssetScale: number, amount: bigint) => Promise<bigint>;
}

export type FXPair = {
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate?: string;
  timestamp?: number;
}

export type FxServiceConfig = {
  fxClient: AxiosInstance;
  defaultCacheTime: number;
}

const toCurrencyPair = (from: string, to: string): string => {
  return from.toLowerCase() + '-' + to.toLowerCase()
}

export class FxService {
  private _client: AxiosInstance
  private _pairs: Map<string, FXPair>
  private _cacheTime: number

  constructor (config: FxServiceConfig) {
    this._pairs = new Map<string, FXPair>()
    this._cacheTime = config.defaultCacheTime

    this._client = config.fxClient

    const usdXrp: FXPair = {
      pair: 'xrp-usd',
      baseCurrency: 'XRP',
      quoteCurrency: 'USD'
    }
    this._pairs.set('xrp-usd', usdXrp)

    const xrpUsd: FXPair = {
      pair: 'xrp-usd',
      baseCurrency: 'USD',
      quoteCurrency: 'XRP'
    }
    this._pairs.set('usd-xrp', xrpUsd)
  }

  async convert (from: string, to: string, fromAssetScale: number, toAssetScale: number, amount: bigint): Promise<bigint> {
    const currencyPair = toCurrencyPair(from, to)

    const rate = from === to ? 1.0 : await this.getConversionRate(currencyPair)

    // TODO casting is not safe for other values
    const amountNumber = Number(amount)
    const convertedNumber = rate * amountNumber

    const scaleConversionFactor = new BigNumber(10).pow(toAssetScale - fromAssetScale)
    const scaledNumber = Math.floor(convertedNumber * scaleConversionFactor.toNumber())

    return BigInt(scaledNumber)
  }

  private async getConversionRate (currencyPair: string): Promise<number> {
    const pair = this._pairs.get(currencyPair)

    if (pair) {
      if (pair.timestamp && Math.floor(Date.now()) < pair.timestamp + this._cacheTime) {
        return Number(pair.rate)
      }
      const quotedRate = await this._client.get(`/data/price?fsym=${pair.baseCurrency.toUpperCase()}&tsyms=${pair.quoteCurrency.toUpperCase()}`).then(response => {
        return response.data[pair.quoteCurrency]
      })
      pair.rate = quotedRate
      pair.timestamp = Math.floor(Date.now())
      return Number(pair.rate)
    } else {
      throw new Error('Currency Pair not found')
    }
  }
}
