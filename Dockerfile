# Use an official Node.js 18 runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any necessary packages
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy the rest of your application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run your app using ts-node
CMD ["ts-node", "src/index.ts"]