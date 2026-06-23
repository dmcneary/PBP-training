FROM node:20-alpine AS client-build

WORKDIR /usr/src/app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .
COPY --from=client-build /usr/src/app/client/dist ./client/dist

EXPOSE 3001

CMD ["npm", "run", "start"]
