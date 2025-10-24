# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for faster caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Set environment variable for production
ENV NODE_ENV=production

# Expose the backend port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
