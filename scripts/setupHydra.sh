docker network create hydra

export SECRETS_SYSTEM=mysupersecretsecret
export DSN=memory

# Needs to be the urls for wallet-gui
export URLS_CONSENT=http://localhost:3000/consent
export URLS_LOGIN=http://localhost:3000/login
export URLS_LOGOUT=http://localhost:3000/logout

docker run -d \
  --name oauth-hydra \
  --network hydra \
  -p 9000:4444 \
  -p 9001:4445 \
  -e SECRETS_SYSTEM=$SECRETS_SYSTEM \
  -e DSN=$DSN \
  -e URLS_SELF_ISSUER=http://localhost:9000/ \
  -e URLS_CONSENT=$URLS_CONSENT \
  -e URLS_LOGIN=$URLS_LOGIN \
  -e URLS_LOGOUT=$URLS_LOGOUT \
  oryd/hydra:latest serve all --dangerous-force-http

docker run --rm -it \
  -e HYDRA_ADMIN_URL=http://oauth-hydra:4445 \
  --network hydra \
  oryd/hydra:latest \
  clients create --skip-tls-verify \
    --id frontend-client \
    --secret secret \
    --token-endpoint-auth-method none \
    --grant-types authorization_code,refresh_token \
    --response-types token,code,id_token \
    --scope openid,offline \
    --callbacks http://localhost:3000/callback
