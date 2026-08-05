# Stage 1: Build the React frontend
ARG TARGETPLATFORM=linux/amd64
ARG NODE_VERSION=22

FROM --platform=${TARGETPLATFORM} node:${NODE_VERSION}-slim  AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the Linux ARM64 Rollup module explicitly
# RUN npm install -D @rollup/rollup-linux-arm64-gnu@4.36.0

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install only production dependencies for the final image
RUN npm ci --omit=dev

# Stage 2: Set up the production environment
FROM --platform=${TARGETPLATFORM} node:${NODE_VERSION}-alpine

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodeuser

# Set the working directory
WORKDIR /app

# Copy package.json files from build stage
COPY --from=build /app/package*.json ./

# Copy production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy the Express server code
COPY server ./server

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist

# Copy SSL certificates from the build stage (where they were copied with the "COPY . ." command)
COPY --from=build /app/server.key ./server.key
COPY --from=build /app/server.crt ./server.crt

# Set proper permissions
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose the port the app runs on
EXPOSE 3000 1234

# Start the application in production mode
CMD ["npm", "run", "serve"]
