# BookShelf CRUD

An Ionic Angular tabs app for managing a personal book collection.

## Run locally

```bash
npm install
npm start -- --port 8100
```

Open `http://localhost:8100` after the development server starts.

## Run in Docker

Build the image from this `book-crud` directory:

```bash
docker build -t ionic-crud .
docker images ionic-crud
```

Record the `ionic-crud` image's tag, image ID, and size from the output. Then start it:

```bash
docker run -d -p 8100:8100 --name ionic-crud-container ionic-crud
docker ps
```

Open `http://localhost:8100` and test adding, editing, deleting, and refreshing books.
These operations require Realtime Database rules that allow read and write access, as described
below. When finished, stop and remove the container; this does not remove the image:

```bash
docker stop ionic-crud-container
docker rm ionic-crud-container
docker images ionic-crud
```

## CI/CD with GitHub Actions

The workflow in `.github/workflows/ci-cd.yml` runs tests and a production build
on a GitHub-hosted Windows runner for pushes and pull requests targeting `main`.
After those checks pass, pushes to `main` and manually dispatched runs build and
deploy the Docker image on a Windows self-hosted runner. Pull requests run CI only.

To enable deployment:

1. Push this project to a GitHub repository with its default branch named `main`.
2. In **Settings → Actions → Runners**, add a **Windows x64** self-hosted runner
   and configure it using the temporary command and token GitHub provides.
   Keep the runner online and ensure Docker Desktop is running for deployments.
3. Push a change to `main`, or start **CI/CD Pipeline** from the repository's
   **Actions** tab. The deployed app is available at `http://localhost:8100` on
   the runner computer.

Never put the runner registration token in the repository or workflow file.

## Firebase Realtime Database

Book records are stored under the `books` path in the configured Firebase Realtime Database.
Before running the app, enable Realtime Database for the Firebase project and configure its
rules to allow this app to read and write that path. This project does not currently implement
sign-in, so authenticated-only rules will reject its requests. For a classroom demo, use a
separate test database with temporary rules and do not deploy those rules publicly. Add Firebase
Authentication and restrictive Security Rules before production use. The Firebase web
configuration is included in the frontend and is not a private credential.

## Book data model

Each book has a title, author, genre, ISBN, and reading status (`To Read`, `Reading`, or
`Finished`). Create records in **Add Book**; search, filter, edit, delete, refresh, and reorder
them in **My Library**.

The app includes Ionic search, segment filters, an edit modal, delete confirmations, toast and
loading feedback, pull-to-refresh, sliding delete actions, and drag-to-reorder. Create, read,
update, delete, and ordering changes are synchronized with Firebase Realtime Database.
