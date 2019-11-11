import {Agreement, App} from "../../src";
import { AgreementBucket } from "../../src/services/agreementBucket"
const MockRedis = require('ioredis-mock')



describe('Agreement Bucket', () => {
  let agreement: Agreement
  let agreementBucket: AgreementBucket
  let mockRedis = MockRedis

  describe('Handle a basic agreement that only has an amount specific', () => {
    beforeEach(async () => {
      mockRedis = new MockRedis()
      agreementBucket = new AgreementBucket(mockRedis)
      agreement = new Agreement()
      agreement.amount = '100'
      agreement.id = '123'
      agreement.start = Date.now()
    })

    test(
      'Can take amount if funds available if available for current interval',
      async () => {
        let didThrow = false
        await agreementBucket.take(agreement, 50).catch(error => {
          console.log(error)
          didThrow = true
        })
        expect(didThrow).toBe(false)
      }
    )

    test('Can take, return and retake amount within mandate', async () => {
      let didThrow = false
      await agreementBucket.take(agreement, 50).catch(error => {
        console.log(error)
        didThrow = true
      })
      await agreementBucket.take(agreement, -50).catch(error => {
        console.log(error)
        didThrow = true
      })
      await agreementBucket.take(agreement, 100).catch(error => {
        console.log(error)
        didThrow = true
      })
      expect(didThrow).toBe(false)
    })

    test(
      'Throws error if try to take more than available for interval',
      async () => {
        let didThrow = false
        await agreementBucket.take(agreement, 101).catch(error => {
          didThrow = true
        })
        expect(didThrow).toBe(true)
      }
    )

    test('Throws if trying to pull after expiry', async () => {
      agreement.expiry = Date.now()
      let didThrow = false

      await agreementBucket.take(agreement, 50).catch(error => {
        didThrow = true
      })

      expect(didThrow).toBe(true)
    })

    test('can show how much is left in the bucket', async () => {
      let didThrow = false

      await agreementBucket.take(agreement, 24).catch(error => {
        didThrow = true
      })

      expect(await agreementBucket.getFillLevel(agreement)).toEqual(24)
      expect(didThrow).toBe(false)
    })

    describe('Cycles', () => {
      let clock: any

      beforeEach(() => {
        agreement = new Agreement()
        agreement.cycles = 2
        agreement.interval = 'P1D'
        agreement.amount = '100'
        agreement.id = '123'
        agreement.start = Date.now()
      })
      afterEach(() => {
      })

      test(
        'Fails if pulled to much in this cycle but will succeed when pulling in next cycle',
        async () => {
          //Take three times from this cycle
          const take1 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            return false
          })
          const take2 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            console.log(error)
            return false
          })
          const take3 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            return false
          })

          expect(take1).toBe(true)
          expect(take2).toBe(true)
          expect(take3).toBe(false)

          // Tick 25hrs
          const now = Date.now()
          Date.now = jest.fn(() => now + 25*60*60*1000)
          //Take three times from this cycle
          const take1Cycle2 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            return false
          })
          const take2Cycle2 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            return false
          })
          const take3Cycle2 = await agreementBucket.take(agreement, 50).then(() => true).catch(error => {
            return false
          })

          expect(take1Cycle2).toBe(true)
          expect(take2Cycle2).toBe(true)
          expect(take3Cycle2).toBe(false)
        }
      )

      test('shows balance for current interval', async () => {
        //Take three times from this cycle
        const take1 = await agreementBucket.take(agreement, 49).then(() => true).catch(error => {
          return false
        })


        expect(take1).toBe(true)
        expect(await agreementBucket.getFillLevel(agreement)).toEqual(49)

        // Tick 25hrs
        const now = Date.now()
        Date.now = jest.fn(() => now + 25*60*60*1000)

        expect(await agreementBucket.getFillLevel(agreement)).toEqual(0)

        //Take three times from this cycle
        const take1Cycle2 = await agreementBucket.take(agreement, 49).then(() => true).catch(error => {
          return false
        })

        expect(take1Cycle2).toBe(true)
        expect(await agreementBucket.getFillLevel(agreement)).toEqual(49)
      })

    })
  })
})
