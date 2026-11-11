FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install

FROM node:20-alpine AS build

WORKDIR /app

ENV NODE_ENV=production

# next.config.js's rewrites() destination is resolved once, at `next build`,
# and baked into .next/ — the container's runtime env has no effect on it.
# Without this build arg, a self-hosted docker-compose build always falls
# back to the production Render URL regardless of what docker-compose.yml
# sets for NEXT_PUBLIC_API_URL at container start.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY next-env.d.ts ./
COPY src ./src
COPY tailwind.css ./tailwind.css

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]

