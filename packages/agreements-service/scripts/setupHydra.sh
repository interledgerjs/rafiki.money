docker network create hydra

export SECRETS_SYSTEM=mysupersecretsecret
export DSN=memory

# Needs to be the urls for wallet-gui
export URLS_CONSENT=http://localhost:3000/oauth/consent
export URLS_LOGIN=http://localhost:3000/oauth/login


docker run -d \
  --name ory-hydra-example--hydra \
  --network hydra \
  -p 9000:4444 \
  -p 9001:4445 \
  -e SECRETS_SYSTEM=$SECRETS_SYSTEM \
  -e DSN=$DSN \
  -e URLS_SELF_ISSUER=http://localhost:9000/ \
  -e URLS_CONSENT=$URLS_CONSENT \
  -e URLS_LOGIN=$URLS_LOGIN \
  oryd/hydra:v1.0.0 serve all --dangerous-force-http