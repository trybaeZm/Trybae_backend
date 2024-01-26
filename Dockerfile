# Specify the base image
FROM node:18-slim

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy application files
COPY . .

# Expose the port your app runs on
EXPOSE 4455

# Define the command to run your app
CMD ["node", "server.js"]
