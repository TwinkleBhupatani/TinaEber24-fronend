FROM node AS build
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build 

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *

COPY --from=build /app/dist/Frontend/browser .
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
