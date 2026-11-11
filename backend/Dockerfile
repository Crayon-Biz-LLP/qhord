FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma
RUN npm install --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm install typescript ts-node-dev prisma@5.14.0 @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors --save-dev && \
    npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY prisma ./prisma
# `prisma` (the CLI, used below by `migrate deploy`) is a devDependency and
# wouldn't otherwise make it into this production install.
RUN npm install --only=production && npm install prisma@5.14.0 --no-save

COPY --from=build /app/dist ./dist

EXPOSE 4000

# schema.prisma defines tables (e.g. the workflow models) that a fresh
# database has no migration history for — this applies them before the app
# starts instead of silently 500ing on every query against a missing table.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

