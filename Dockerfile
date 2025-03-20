# Stage 1: Build the React frontend
FROM node:22 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the Linux ARM64 Rollup module explicitly
RUN npm install -D @rollup/rollup-linux-arm64-gnu@4.36.0

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Set up the production environment
FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the Express server code
COPY server ./server

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist

# Copy necessary config files
COPY .env* ./

# Expose the port the app runs on
EXPOSE 3000 1234

# Start the application in production mode
CMD ["npm", "run", "serve"]
