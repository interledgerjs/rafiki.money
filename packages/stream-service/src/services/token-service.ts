import { Client, Issuer, TokenSet } from 'openid-client'

export type TokenServiceConfig = {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  tokenRefreshTime: number;
}

export class TokenService {
  private _issuerUrl: string
  private _clientId: string
  private _clientSecret: string
  private _tokenRefreshTime: number
  private _client: Client

  private _token: TokenSet

  constructor (config: TokenServiceConfig) {
    this._issuerUrl = config.issuerUrl
    this._clientId = config.clientId
    this._clientSecret = config.clientSecret
    this._tokenRefreshTime = config.tokenRefreshTime
    this.setup()
  }

  async setup (): Promise<void> {
    const issuer = await Issuer.discover(this._issuerUrl)

    this._client = new issuer.Client({
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: this._clientId,
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_secret: this._clientSecret
    })
  }

  async getAccessToken (): Promise<string> {
    if(!this._client) {
      await this.setup()
    }
    return new Promise<string>((resolve) => {
      if (!this._token || this._token.expired()) {
        this._client.grant({
          // eslint-disable-next-line @typescript-eslint/camelcase
          grant_type: 'client_credentials'
        }).then(response => {
          this._token = response
          resolve(this._token.access_token)
        })
      } else {
        resolve(this._token.access_token)
      }
    })
  }
}
