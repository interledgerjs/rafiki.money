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

  async setup () {
    const issuer = await Issuer.discover(this._issuerUrl)

    this._client = new issuer.Client({
      client_id: this._clientId,
      client_secret: this._clientSecret
    })
  }

  async getAccessToken (): Promise<string> {
    if (!this._client) {
      await this.setup()
    }
    return new Promise<string>((resolve, reject) => {
      if (!this._token || this._token.expired()) {
        this._client.grant({
          grant_type: 'client_credentials'
        }).then((token: TokenSet) => {
          this._token = token
          console.log('token from hydra', token)
          resolve(this._token.access_token)
        }).catch((error: any) => { reject(error) })
      } else {
        resolve(this._token.access_token)
      }
    })
  }
}
