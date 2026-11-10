# Docker_Crud

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

This builds the production Angular app and serves it with Nginx. Start it:

```bash
docker run -d -p 8100:80 --name ionic-crud-container ionic-crud
docker ps
```

Open `http://localhost:8100` and test adding, editing, deleting, and refreshing books. When
finished, stop and remove the container; this does not remove the image:

```bash
docker stop ionic-crud-container
docker rm ionic-crud-container
docker images ionic-crud
```

## CI/CD with GitHub Actions

The workflow in `.github/workflows/ci-cd.yml` runs tests and a production build
on a GitHub-hosted Windows runner for pushes and pull requests targeting `main`.
After CI succeeds, pushes to `main` and manually dispatched runs deploy the
Docker container to a Windows self-hosted runner. Pull requests run CI only.

To enable deployment:

1. In the GitHub repository, open **Settings → Actions → Runners** and add a
   **Windows x64** self-hosted runner. Configure it using the temporary
   instructions and registration token provided by GitHub; never put the token
   in this repository.
2. Keep the runner online and make sure Docker Desktop is running on its
   computer. The account running the runner must be able to use Docker.
3. Push a change to `main`, or start **CI/CD Pipeline** from the repository's
   **Actions** tab. After CI passes, the workflow replaces the `ionic-crud`
   container and serves the app at `http://localhost:8100` on the runner
   computer.

## Firebase Cloud Firestore

Book records are stored in the `books` Cloud Firestore collection. The app is
configured for the `crud-harvey` Firebase project. Enable Cloud Firestore there
and configure its rules before using the app. The checked-in `firestore.rules`
contains a temporary unauthenticated lab rule that expired on October 20, 2026;
do not extend public access for production. This app does not currently implement
sign-in, so use an appropriate test-only ruleset or add Firebase Authentication
and restrictive rules before production use. The Firebase web configuration is
included in the frontend and is not a private credential.

## Book data model

Each book has a title, author, genre, ISBN, and reading status (`To Read`, `Reading`, or
`Finished`). Create records in **Add Book**; search, filter, edit, delete, refresh, and reorder
them in **My Library**.

The app includes Ionic search, segment filters, an edit modal, delete confirmations, toast and
loading feedback, pull-to-refresh, sliding delete actions, and drag-to-reorder. Create, read,
update, delete, and ordering changes are synchronized with Firebase Cloud Firestore.
