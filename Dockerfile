FROM node:21-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

# Generate Prisma client before building
RUN npx prisma generate

# Build the application
RUN pnpm build

EXPOSE 4000

# Use production node environment by default
ENV NODE_ENV production

CMD [ "pnpm", "start" ]
