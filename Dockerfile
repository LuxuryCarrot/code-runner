# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy the root package.json
COPY package.json ./

# Copy the client package.json and package-lock.json
COPY code-runner-client/package.json code-runner-client/package-lock.json ./code-runner-client/

# Copy the server package.json and package-lock.json
COPY code-runner-server/package.json code-runner-server/package-lock.json ./code-runner-server/

# Install dependencies for both client and server
RUN npm install --prefix code-runner-client
RUN npm install --prefix code-runner-server

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

# Ensure PowerShell is available in PATH
RUN ln -s /usr/bin/pwsh /usr/bin/powershell

# Copy the rest of the application code
COPY . .

# Build the client
WORKDIR /app/code-runner-client
RUN npm run build

# Set the working directory for the server
WORKDIR /app/code-runner-server

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the server
CMD ["npm", "start"]
