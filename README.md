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
* Run npm install
* Run npm client

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

## Ride with GPS Import
* Endpoint: `POST /api/rwgps/import` (requires logged-in session)
* Provide credentials either:
  * In request body: `{ "apiKey": "...", "authToken": "...", "limit": 20 }`
  * Or via server env vars: `RWGPS_API_KEY` and `RWGPS_AUTH_TOKEN`
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

