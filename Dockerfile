FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
