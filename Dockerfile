FROM node:18-alpine

WORKDIR /app

# Copy package files and install with legacy-peer-deps to avoid version conflict
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set production env
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
