FROM node:22-alpine

WORKDIR /app

# Install dependencies (utilizing cache)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Configure environment variables and port
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["pnpm", "dev"]
