FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && npm ci \
    && npm rebuild bcrypt --build-from-source \
    && apt-get remove -y python3 make g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /root/.npm/*

# Copy source code
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
