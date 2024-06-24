# Stage 1: Build Angular Application
FROM node AS build

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install --legacy-peer-deps

# Copy the rest of the application code and build
COPY . .
RUN npm run build --prod

# Stage 2: Serve Angular Application with Nginx
FROM nginx:1.27.0-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from Stage 1
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
