


## Prerequisites


### PostgreSQL

Need an instance to store formatted data in a PostgreSQL database. Configure the connection in the `.env` file.


Need to setup db migrations frist, this will create the `Batch` table in the database.

```bash
npx prisma migrate dev --name init
```

### Grafana

Connect the PostgreSQL database to Grafana first, and import the `grafana/board.json` file to your Grafana instance.

## Run

Copy the `.env.example` file to `.env` and configure the necessary fields

```sh
cp .env.example .env
```

Configure the `batchStart` and `batchEnd` in the `index.ts` file, it will let the script to generate and process the data between the two batches.

```sh
npx ts-node ./index.ts
```