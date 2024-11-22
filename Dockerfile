# Use the official Node.js 20 image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Prisma CLI and Prisma Client
RUN npm install prisma --save-dev
RUN npm install @prisma/client

# Copy the rest of the application code to the working directory
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port 3500
EXPOSE 3500

# Start the Node.js application
CMD ["npm", "run", "start"]
