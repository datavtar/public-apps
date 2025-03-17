
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for better compatibility
RUN npm install --save-dev ajv ajv-keywords --force
RUN npm install --legacy-peer-deps
    
RUN npm install -g serve@latest

# Copy the rest of the application
COPY . ./

# Set build-time environment variables
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Create necessary directories and run build
RUN mkdir -p /app/build && \
    npm rebuild && \
    npm run build || (echo "Build failed" && ls -la && exit 1)

# Verify build exists and clean up
RUN test -d build && \
    test -f build/index.html && \
    echo "Build verified successfully" && \
    rm -rf node_modules && \
    npm cache clean --force

# Expose the port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start serving the application
CMD ["serve", "-s", "build", "-l", "3000"]
