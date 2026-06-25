# PBP Planner
# Final-Project
UCLA Extension final project

## Developers
* David McNeary
* Jin Young Kim
* Vinny Puranam
* Lori Muller


## Installing
* To ensure that you can run this app, please install:
* Run `npm ci`
* Run `npm run install:client`
* Run `npm run start:dev`

## Built With
* React
* Node 
* Express
* Mongodb
* Mongoose
* Passport with BCrypt
* Leaflet
* Leaflet Routing Machine
* React Router

## Docker (Dev)
* Start Mongo + API + Client: `docker compose up --build`
* Stop: `docker compose down`

## Private Beta Runbook (2027 Audax Season)
Target: private beta by January 1, 2027 for PBP/Audax season planning.

### Release gates
Run these before deploying:

```sh
npm ci
npm run test:server
cd client && npm ci && cd ..
npm run test:client
npm run build
```

### Managed PaaS deployment
Use a managed Node service plus managed MongoDB and Redis. Required env vars:

* `NODE_ENV=production`
* `MONGODB_URI`
* `SECRET` - long random value; production startup fails without it.
* `REDIS_URL`
* `RUSA_CACHE_TTL_SECONDS` - defaults to `3600`.
* `RUSA_WARM_REGION_IDS` - comma-separated region ids to warm, defaults to `58` for Pacific Coast Highway Randonneurs.
* `APP_BASE_URL` - deployed app URL for cache warming.

Set the platform build command to `npm ci && npm run build` and the start command to `npm start`. The root build script installs client dependencies and writes `client/dist`, which the Express server serves in production.

Optional server-level Ride with GPS env vars are disabled by default and should only be enabled for a controlled admin/job workflow:

* `RWGPS_ALLOW_SERVER_CREDENTIAL_IMPORTS=false`
* `RWGPS_API_KEY`
* `RWGPS_AUTH_TOKEN`

Ride with GPS credentials can also be supplied per import by the logged-in user; the app does not store those credentials.

### Health and scheduled cache warming
* Health check: `GET /api/health`
* Warm RUSA cache from a scheduler: `npm run cache:warm`
* Recommended schedule: every 1-3 hours during the active brevet planning window.

## Ride with GPS Import
* Endpoint: `POST /api/rwgps/import` (requires logged-in session)
* Provide credentials either:
  * In request body: `{ "apiKey": "...", "authToken": "...", "limit": 20 }`
  * Or, for controlled admin/job use only, via server env vars when `RWGPS_ALLOW_SERVER_CREDENTIAL_IMPORTS=true`
* Import deduplicates on `(userId, source=rwgps, sourceId)` so repeated imports are safe.
* Dashboard includes a "Ride with GPS import" panel to run imports interactively.

### Tests (with Docker Mongo)
1. `docker compose up -d mongo`
2. `MONGODB_URI=mongodb://localhost:27017/pbp-planner-test npm test`

# App Flow

## Landing Page - if not logged in
![Landing Page](https://i.imgur.com/4b0wwEu.jpg)

## Log In Page 
![Landing Page](https://i.imgur.com/XR8p3Zt.jpg)

## Sign Up Page
![Landing Page](https://i.imgur.com/pxOfOXX.png)

## Dashboard
![Landing Page](https://i.imgur.com/hZ1nHbX.jpg)

## Acitivity Sign Up
![Landing Page](https://i.imgur.com/NCRA0ZI.jpg)

## All Activities
![Landing Page](https://i.imgur.com/saieGup.jpg)

## Challenge Page
![Landing Page](https://i.imgur.com/bean94Q.jpg)

## Challenge Sign Up
![Landing Page](https://i.imgur.com/w8KpIaO.png)
