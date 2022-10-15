WIP Example of an Interledger Native Custodial Wallet. DO NOT USE IN PRODUCTION

# Local Dev Setup

## Dependency Installs

Run a yarn install at the root of the project
```shell
yarn install
```

Run a yarn install in `packages/frontend`
```shell
yarn install
```

## Setup Docker Database

Start the Postgres DB
```shell
./scripts/setupDatabase.sh
```
The docker exec commands may fail, just rerun the script again to ensure the databases are created correctly

Start Hydra
```shell
./scripts/setupHydra.sh
```

## Start Services (in order)
Its important the services are started in this particular order
1. `packages/ilp-connector`
2. `packages/backend`
3. `packages/frontend`

Start Connector by running this in `packages/ilp-connector`
```shell
yarn start
```

Start Backend by running this in `packages/backend`
```shell
yarn build
yarn start
```

Start Frontend by running this in `packages/frontend`
```shell
yarn dev
