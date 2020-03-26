sh setupHydra.sh
sh setupDatabase.sh
sh setupDatabase.sh
cd ../packages/backend
knex migrate:latest
# knex seed:run
yarn install
yarn build
yarn start