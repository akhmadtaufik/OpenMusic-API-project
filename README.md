# OpenMusic API

## 1. Project Overview

The OpenMusic API is a RESTful web service designed to manage a music library. It allows users to interact with albums, songs, and playlists, manage their user accounts, and collaborate on playlists. The API supports features like user authentication, playlist export, album cover uploads, and liking albums.

### Key Features

* User registration and JWT-based authentication.
* CRUD operations for Albums and Songs.
* Playlist management: create, view, delete, add/remove songs.
* Playlist collaboration.
* Asynchronous playlist export to email via RabbitMQ.
* Album cover image uploads to AWS S3.
* Liking/unliking albums with like counts (cached with Redis).
* Database migrations.

### Technologies Used

* **Backend:** Node.js, Hapi.js framework
* **Database:** PostgreSQL
* **Caching:** Redis
* **Message Broker:** RabbitMQ (for playlist exports)
* **File Storage:** AWS S3 (for album covers)
* **Authentication:** JSON Web Tokens (JWT)
* **Validation:** Joi
* **Password Hashing:** bcrypt
* **Development:** Nodemon
* **Linting:** ESLint
* **Environment Management:** dotenv
* **Database Migrations:** node-pg-migrate

## 2. Installation Guide

### Prerequisites

* Node.js (v18.x or later recommended)
* npm (usually comes with Node.js)
* PostgreSQL server (running and accessible)
* Redis server (running and accessible)
* RabbitMQ server (running and accessible)
* AWS S3 bucket and credentials

### Environment Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd openmusic-api
    ```

2. **Create a `.env` file:**
    Copy the `.env.example` file (if one exists) or create a new `.env` file in the root of the project. Populate it with the necessary environment variables (see [Environment Variables](#5-environment-variables) section below).

    Example `.env` structure:

    ```env
    # Server Configuration
    HOST=localhost
    PORT=5000

    # PostgreSQL Configuration
    PGHOST=localhost
    PGUSER=your_pg_user
    PGPASSWORD=your_pg_password
    PGDATABASE=openmusicdb
    PGPORT=your_port

    # JWT Configuration
    ACCESS_TOKEN_KEY=your_super_secret_access_token_key
    REFRESH_TOKEN_KEY=your_super_secret_refresh_token_key
    ACCESS_TOKEN_AGE=1800 # 30 minutes in seconds
    REFRESH_TOKEN_AGE=604800 # 7 days in seconds

    # RabbitMQ Configuration
    RABBITMQ_SERVER=amqp://guest:guest@localhost:5672/

    # Redis Configuration
    REDIS_SERVER=localhost 

    # AWS S3 Configuration
    AWS_REGION=your_s3_bucket_region
    AWS_ACCESS_KEY_ID=your_aws_access_key_id
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
    AWS_BUCKET_NAME=your_s3_bucket_name
    S3_URL_EXPIRATION=604800 # Optional: 7 days in seconds for presigned URLs
    ```

### Install Dependencies

Navigate to the project root and run:

```bash
npm install
```

### Database Migrations

Run the database migrations to set up the schema:

```bash
npm run migrate:up
```

### Start the Development Server

To start the server with Nodemon (auto-restarts on file changes):

```bash
npm run start-dev
```

The server will typically be available at `http://localhost:PORT` (e.g., `http://localhost:5000`).

To start the server for production:

```bash
npm start
```

## 3. Authentication & Authorization

### Overview

This API uses JSON Web Tokens (JWT) for authentication.

1. Users register via the `POST /users` endpoint.
2. Users log in via the `POST /authentications` endpoint with their username and password.
3. Upon successful login, the API returns an `accessToken` and a `refreshToken`.
4. The `accessToken` is short-lived and must be included in the `Authorization` header as a Bearer token for accessing protected routes (e.g., `Authorization: Bearer <accessToken>`).
5. When the `accessToken` expires, the client can use the `refreshToken` with the `PUT /authentications` endpoint to obtain a new `accessToken`.
6. Logging out via `DELETE /authentications` invalidates the `refreshToken`.

### Access Control Summary

* **Public Routes:** User registration (`POST /users`), user login (`POST /authentications`), token refresh (`PUT /authentications`), logout (`DELETE /authentications`), viewing all songs (`GET /songs`), viewing specific songs (`GET /songs/{id}`), viewing albums (`GET /albums/{id}`), viewing album like counts (`GET /albums/{id}/likes`), and currently, all other album, song, user, and album cover upload modification/creation routes (though these are typically protected).
* **Authenticated Routes:** Managing playlists, collaborations, exporting playlists, and liking/unliking albums require a valid JWT `accessToken`.

## 4. API Reference

For a complete list of API endpoints, request/response formats, and detailed explanations, please see the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

## 5. Environment Variables

The following environment variables are required or commonly used by the application. Create a `.env` file in the project root to set these.

| Variable                      | Description                                                          | Example Value                              |
| :---------------------------- | :------------------------------------------------------------------- | :----------------------------------------- |
| `HOST`                        | Hostname for the server                                              | `localhost`                                |
| `PORT`                        | Port for the server                                                  | `your_port`                                     |
| `PGHOST`                      | PostgreSQL host                                                      | `localhost`                                |
| `PGUSER`                      | PostgreSQL username                                                  | `postgres`                                 |
| `PGPASSWORD`                  | PostgreSQL password                                                  | `secret`                                   |
| `PGDATABASE`                  | PostgreSQL database name                                             | `your_dbname`                              |
| `PGPORT`                      | PostgreSQL port                                                      | `your_port`                                     |
| `ACCESS_TOKEN_KEY`            | Secret key for signing JWT access tokens                             | `your_very_strong_access_key`              |
| `REFRESH_TOKEN_KEY`           | Secret key for signing JWT refresh tokens                            | `your_very_strong_refresh_key`             |
| `ACCESS_TOKEN_AGE`            | Access token expiration time in seconds                              | `1800` (for 30 minutes)                    |
| `REFRESH_TOKEN_AGE`           | Refresh token expiration time in seconds (optional)                  | `604800` (for 7 days)                      |
| `RABBITMQ_SERVER`             | RabbitMQ connection string                                           | `your_connection`             |
| `REDIS_SERVER`                | Redis server hostname                                                | `localhost`                                |
| `AWS_REGION`                  | AWS S3 bucket region                                                 | `us-east-1`                                |
| `AWS_ACCESS_KEY_ID`           | AWS IAM user access key ID for S3                                    | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET_ACCESS_KEY`       | AWS IAM user secret access key for S3                                | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_BUCKET_NAME`             | Name of the AWS S3 bucket for storing covers                         | `your_bucket_name`               |
| `S3_URL_EXPIRATION`           | Presigned URL expiration in seconds (optional)                       | `604800` (for 7 days)                      |
| `RABBITMQ_PORT`               | RabbitMQ AMQP port (for Docker Compose)                              | `your_port`                                     |
| `RABBITMQ_MANAGEMENT_UI_PORT` | RabbitMQ Management UI port (for Docker Compose)                     | `your_port`                                    |
| `RABBITMQ_USERNAME`           | RabbitMQ default username (for Docker Compose)                       | `guest`                                    |
| `RABBITMQ_PASSWORD`           | RabbitMQ default password (for Docker Compose)                       | `guest`                                    |
| `RABBITMQ_ERLANG_COOKIE`      | RabbitMQ Erlang cookie (for Docker Compose clustering)               | `your_strong_random_erlang_cookie`         |
| `MINIO_ACCESS_KEY`            | Minio Root User (Access Key for S3 compatible storage in Docker)     | `your_access_key`                               |
| `MINIO_SECRET_KEY`            | Minio Root Password (Secret Key for S3 compatible storage in Docker) | `your_secret_key`                               |

## 6. Testing

This project uses ESLint for code linting:

```bash
npm run lint
```

While there isn't a dedicated `npm test` script in `package.json`, the project includes Postman collections (`test/*.postman_collection.json`) which can be used for manual API testing.

**To test authenticated routes with Postman:**

1. Use the "Login" request (`POST /authentications`) with valid user credentials to obtain an `accessToken` and `refreshToken`.
2. For subsequent requests to protected endpoints, include the `accessToken` in the "Authorization" header:
    * Set "Type" to "Bearer Token".
    * Paste the `accessToken` into the "Token" field.
3. When the `accessToken` expires, use the "Refresh Access Token" request (`PUT /authentications`) with the `refreshToken` in the request body to get a new `accessToken`.

## 7. Deployment

### Using Docker (Recommended for Development)

This project includes a `Dockerfile` and a `docker-compose.yml` file to facilitate containerized development and deployment. This setup orchestrates the API application along with its dependencies: PostgreSQL, RabbitMQ, Redis, and Minio (as an S3-compatible local object storage).

**Prerequisites for Docker:**

* Docker Engine installed (see [Docker documentation](https://docs.docker.com/engine/install/))
* Docker Compose installed (usually included with Docker Desktop, or see [Docker Compose documentation](https://docs.docker.com/compose/install/))

**Setup & Running with Docker Compose:**

1. **Ensure `.env` file is configured:**
    Create or update your `.env` file in the project root. For Docker Compose, some variables need to point to service names defined in `docker-compose.yml` or use values specific to the Docker environment. Pay special attention to:
    * `PORT`: Should match the port exposed by the `app` service in `docker-compose.yml`.
    * `PGHOST`: Set to the PostgreSQL service name, e.g., `postgres-db`.
    * `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Must match the `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` values for the `postgres-db` service.
    * `RABBITMQ_SERVER`: Set to `amqp://<RABBITMQ_USERNAME>:<RABBITMQ_PASSWORD>@rabbitmq:<RABBITMQ_PORT_INTERNAL_OR_DEFAULT>`
    * `REDIS_SERVER`: Set to the Redis service name, e.g., `redis`.
    * For Minio (local S3 alternative):
        * `AWS_REGION`: Can be a placeholder like `us-east-1`.
        * `AWS_ACCESS_KEY_ID`: Set to your `MINIO_ACCESS_KEY` from `.env`.
        * `AWS_SECRET_ACCESS_KEY`: Set to your `MINIO_SECRET_KEY` from `.env`.
        * `AWS_BUCKET_NAME`: The bucket you want Minio to use/create.

    Refer to the `docker-compose.yml` file for service names and environment variable usage.

2. **Build and start services:**
    From the project root, run:

    ```bash
    docker-compose up --build
    ```

    This command will:
    * Build the `app` image using the `Dockerfile`.
    * Pull images for PostgreSQL, RabbitMQ, Minio, and Redis.
    * Create and start containers for all services.
    * The `app` service command includes a delay, then `npm ci`, `npm run migrate:up`, and `npm run start`.

3. **Accessing Services:**
    * **API:** `http://localhost:PORT` (e.g., `http://localhost:5000` if `PORT=5000` in `.env`)
    * **PostgreSQL:** Connect via `localhost:5432` (or as mapped in `docker-compose.yml`)
    * **RabbitMQ Management UI:** `http://localhost:RABBITMQ_MANAGEMENT_UI_PORT` (e.g., `http://localhost:15672`)
    * **Minio Console:** `http://localhost:9001` (API at `http://localhost:9000`)
    * **Redis:** Accessible from the `app` container at `redis:6379`.

4. **Stopping Services:**
    Press `Ctrl+C` in the terminal where `docker-compose up` is running. To stop and remove containers:

    ```bash
    docker-compose down
    ```

    To remove volumes as well (deletes persisted data for DB, RabbitMQ, Minio, Redis):

    ```bash
    docker-compose down -v
    ```

**Notes for Docker Development:**

* The `app` service in `docker-compose.yml` mounts the current directory (`.`) into the container. This means changes to your local code are reflected inside the container, and Nodemon (if `npm run start` uses it, or if `command` is changed to `npm run start-dev`) will restart the Node.js application.
* The `sleep 60` in the `app` service's command is a simple way to wait for other services like PostgreSQL to be ready before running migrations and starting the app. More robust solutions might use `wait-for-it.sh` scripts or health checks.

### General Steps

1. **Environment Variables:** Ensure all necessary environment variables (see section 5) are set in your production environment. Do NOT commit your production `.env` file to version control.
2. **Dependencies:** Install production dependencies: `npm install --omit=dev`
3. **Database:** Set up your production PostgreSQL database and run migrations: `npm run migrate:up`
4. **External Services:** Ensure RabbitMQ, Redis, and AWS S3 are configured and accessible from your production environment.
5. **Start Server:** Use a process manager like PM2 to run the application:

    ```bash
    npm start
    # or with PM2
    # pm2 start ./src/server.js --name openmusic-api
    ```

6. **Reverse Proxy (Recommended):** Consider using a reverse proxy like Nginx or Apache to handle SSL termination, load balancing (if applicable), and serve static assets.

### Considerations

* **Security:** Ensure `ACCESS_TOKEN_KEY` and `REFRESH_TOKEN_KEY` are strong, unique secrets. Review security of all external services.
* **Logging:** Implement more robust logging for production if needed.
* **CORS:** Adjust CORS settings in `src/server.js` if your frontend is on a different domain. Currently, it's set to `origin: ["*"]` which is permissive.
