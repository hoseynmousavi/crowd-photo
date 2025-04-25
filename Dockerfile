# Stage 1: Build Stage
FROM node:23-alpine AS build

# Install build dependencies and tools
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Set the working directory for your application inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to install dependencies
COPY package*.json ./

# Install the dependencies, excluding dev dependencies
RUN npm install --omit=dev

# Install pm2 globally in the build stage
RUN npm install pm2 -g

# Copy the application source code
COPY . .

# Stage 2: Production Stage
FROM node:23-alpine

# Set the working directory for your application
WORKDIR /usr/src/app

# Copy the node_modules and pm2 from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/node_modules/pm2 ./node_modules/pm2

# Copy the application source code
COPY --from=build /usr/src/app ./

# Expose the port your application will run on
EXPOSE 6500

# Set the environment variable for production mode
ENV NODE_ENV=production

# Command to run the application with pm2-runtime
CMD ["pm2-runtime", "start", "src/server.js"]
