FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm install typescript ts-node-dev @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors --save-dev && \
    npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]

