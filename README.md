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
for pushes and pull requests targeting `main`. After those checks pass, pushes
to the default branch and manually dispatched runs build and publish the
container to GitHub Container Registry (GHCR). Pull requests run CI only.
Publishing uses the workflow's `GITHUB_TOKEN`; no registry password or runner
registration token is needed.

The image is tagged with the branch name and commit SHA; `latest` is also
published from the default branch. For this repository, the image is
`ghcr.io/harvzzz-git/docker_crud`. You can run it locally with:

```bash
docker pull ghcr.io/harvzzz-git/docker_crud:latest
docker run --rm -p 8100:80 ghcr.io/harvzzz-git/docker_crud:latest
```

GitHub may keep the package private initially. Change the package's visibility
in its GHCR package settings if it should be publicly pullable.

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
