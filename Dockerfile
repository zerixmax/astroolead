# Stage 1: Build
FROM node:lts-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Astro project
RUN npm run build

# Stage 2: Runtime
FROM nginx:stable-alpine AS runtime

# Copy the build output from the build stage to Nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
