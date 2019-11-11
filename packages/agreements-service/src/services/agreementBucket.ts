import { Agreement } from '../models'
import { Redis } from 'ioredis'
import * as fs from 'fs'
import * as path from 'path'
import { parse, toSeconds } from 'iso8601-duration'

export interface AgreementBucketInterface {
  getFillLevel: (agreement: Agreement) => Promise<number>;
  take: (agreement: Agreement, amount: number) => void;
}

export class AgreementBucket implements AgreementBucketInterface {
  constructor (private _redis: Redis, private _namespace: string = 'agreements') {
    this._redis.defineCommand('take', {
      numberOfKeys: 2,
      lua: fs.readFileSync(path.resolve(__dirname, 'take.lua')).toString()
    })
    this._redis.defineCommand('getBalance', {
      numberOfKeys: 2,
      lua: fs.readFileSync(path.resolve(__dirname, 'agreement-balance.lua')).toString()
    })
  }

  async getFillLevel (agreement: Agreement): Promise<number> {
    const balanceKey = `${this._namespace}:${agreement.id}:balance`
    const intervalKey = `${this._namespace}:${agreement.id}:timestamp`
    const intervalStart = agreement.interval ? this.currentIntervalStart(agreement.start, agreement.interval, agreement.cycles) : agreement.start

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return this._redis.getBalance(balanceKey, intervalKey, intervalStart)
  }

  async take (agreement: Agreement, amount: number): Promise<void> {
    const balanceKey = `${this._namespace}:${agreement.id}:balance`
    const intervalKey = `${this._namespace}:${agreement.id}:timestamp`

    const intervalStart = agreement.interval ? this.currentIntervalStart(agreement.start, agreement.interval, agreement.cycles) : agreement.start
    const maxAmount = agreement.amount

    if (this.hasExpired(agreement.expiry)) {
      throw new Error('Agreement Expired')
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const result = await this._redis.take(balanceKey, intervalKey, maxAmount, intervalStart, amount)
    if (result === 0) {
      throw new Error('No funds available for interval')
    }
  }

  // async available (agreement: Agreement): Promise<void> {
  //   return Promise.resolve(agreement.accountId)
  // }

  private hasExpired (expiry: number | null): boolean {
    return expiry !== null && Date.now() >= expiry
  }

  private currentIntervalStart (start: number, interval: string, cycles: number): number {
    const currentTime = Date.now()
    const timeElapsedSinceStart = currentTime - start
    const duration = toSeconds(parse(interval)) * 1000

    const elapsedCycles = timeElapsedSinceStart / duration

    // Check if we have exceeded the allowable cycles
    if (cycles !== null && elapsedCycles > cycles) {
      throw new Error('Exceeded agreement allowable cycles')
    }

    return start + duration * Math.floor(elapsedCycles)
  }
}
