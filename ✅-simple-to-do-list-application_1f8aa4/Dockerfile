
FROM node:20-alpine

WORKDIR /app

# Install serve for hosting the static files
RUN npm install -g serve@latest

# Just copy the build directory
COPY build/ ./build/

# Verify build exists
RUN test -d build && \
    test -f build/index.html && \
    echo "Build verified successfully"

# Expose the port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start serving the application using shell form to allow variable substitution
CMD serve -s build -l $PORT
