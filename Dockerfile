FROM node:20-bullseye-slim

WORKDIR /app

ENV EXPO_NO_TELEMETRY=1

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002 19006

CMD ["npm", "run", "web"]