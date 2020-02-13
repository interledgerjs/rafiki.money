docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
docker exec -it postgres psql -U postgres -c "CREATE DATABASE testing;"
docker exec -it postgres psql -U postgres -c "CREATE DATABASE development;"
