# Stage 1: Build Stage
FROM oven/bun:alpine AS build

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

WORKDIR /usr/src/app

COPY package*.json ./

RUN bun install

COPY . .

# Stage 2: Production Stage
FROM oven/bun:alpine

# Install runtime dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    bash

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./

# Install pm2 globally
RUN bun install pm2 -g

# Set Puppeteer to use Chromium installed via apk
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Expose your port
EXPOSE 6500

# Start app using pm2
CMD ["pm2-runtime", "start", "src/server.js"]
