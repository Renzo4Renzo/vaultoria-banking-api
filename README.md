# Instructions

## Creating Docker Containers (PostgreSQL image)

- Rebuild docker containers : `docker compose up --build`
- Start the service (in the background): `docker compose up -d`
- Stop the service: `docker compose down`

## Database

The code automatically creates or updates the database each time the server is started, as long as you configure properly the models under the models folder.

You can find population scripts here: [Set Database](queries/set_database.sql)

## Commands

- Run the code: `npm start:dev`
- Run concurrency tests (if available): `npm run test:concurrency`

## Exercise

[Vaultoria Banking API](https://docs.google.com/document/d/1eYI7DzUhdI4CyRDcj-gHQh_Kwjd-Vbpdo7acDIFKJT4/edit?usp=sharing)
