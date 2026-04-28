FROM node:20-bullseye-slim

WORKDIR /app

ENV EXPO_NO_TELEMETRY=1

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npm", "run", "web", "--", "--host", "lan", "--port", "8081"]