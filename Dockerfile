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
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf
# Expose port 80 to the outside world
EXPOSE 80

# Command to run nginx in the foreground
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]
