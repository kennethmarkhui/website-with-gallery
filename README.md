## Running Locally

### Prerequisites

- To run this project, you'll need to have [Node.js](https://nodejs.org/) version 18 (or later) installed on your machine. If you haven't already, please download and install it before proceeding.

```sh
npm -v && node -v
8.19.2
v18.10.0
```

- Install `dotenv-cli` globally.

```sh
npm install -g dotenv-cli
```

- Assuming you have [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/install/) setup, you can easily start your postgres database with the following command from the root directory of this repository(optional).

```sh
docker-compose up
```

- Create a `.env.local` file in the root directory of this repository and provide values using `.env.example` as a guide.

### Installation

1. Install NPM packages

```sh
npm install
```

2. Create database migrations

```sh
npm run db:migrate-dev
```

3. Seed the database(optional)

```sh
npm run db:seed
```

4. Start the development server

```sh
npm run dev
```
