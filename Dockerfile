
# Step 1: Use an official Node.js runtime as a parent image
FROM node:23-alpine

# Step 2: Install Python, build tools, and other dependencies for node-gyp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Step 3: Set the working directory for your application inside the container
WORKDIR /usr/src/app
# Step 4: Install pm2 globally
RUN npm install pm2 -g

# Step 5: Copy the package.json and package-lock.json (if available) into the working directory
COPY package*.json ./

# Step 6: Install the dependencies defined in package.json
RUN npm install --omit=dev

# Step 7: Copy the rest of the application code into the working directory
COPY . .

# Step 8: Expose the port your application will run on (adjust if needed)
EXPOSE 6500

# Step 9: Set the environment variable for production mode
ENV NODE_ENV=production

# Step 10: Command to run the application
CMD ["pm2-runtime", "start", "src/server.js"]
