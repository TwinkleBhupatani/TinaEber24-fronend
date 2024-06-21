# First stage: build the application
FROM node:14 AS build

WORKDIR /usr/src/app

COPY package.json package.json 
COPY package-lock.json package-lock.json 
RUN npm ci
COPY . .
RUN npm run build

# Second stage: run the application using nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf *

COPY --from=build /usr/src/app/dist/Frontend/browser .
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
