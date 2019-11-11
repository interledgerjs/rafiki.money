import { hydraIntrospection } from '../../src/services/auth'
import { hydra } from '../../src/apis/hydra'

describe('Auth Services', function () {
  describe('hydraIntrospection', function () {
    let hydraToken = {}
    beforeEach(() => {
      hydraToken = {
        active: true,
        ext: {
          interledger: {
            agreement: {
              id: 'aefg-123',
              userId: '5',
              accountId: 'test',
              amount: '10',
              assetScale: '2',
              assetCode: 'USD'
            }
          }
        },
        sub: '5'
      }
    })
    test('asks hydra to introspect', async () => {
      hydra.introspectToken = jest.fn().mockImplementation(() => hydraToken)

      await hydraIntrospection('test')

      expect(hydra.introspectToken).toHaveBeenCalled()
    })

    test('returns an inactive token if error occurs', async () => {
      hydra.introspectToken = jest.fn().mockImplementation(() => { throw new Error('Test error') })

      await expect(hydraIntrospection('test')).resolves.toEqual({ active: false })
    })
  })
})
