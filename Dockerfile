# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install dependencies for PowerShell
RUN apt-get update && apt-get install -y \
    wget \
    apt-transport-https \
    software-properties-common

# Import the public repository GPG keys and register the Microsoft repository
RUN wget -q "https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb" \
    && dpkg -i packages-microsoft-prod.deb

# Install PowerShell
RUN apt-get update && apt-get install -y powershell

# Copy the rest of the application code
COPY . .

# Build the client
WORKDIR /app/code-runner-client
RUN npm install && npm run build

# Install server dependencies
WORKDIR /app/code-runner-server
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]
