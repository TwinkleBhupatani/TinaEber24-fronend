FROM node
WORKDIR /usr/src/app

COPY package.json package.json 
COPY package-lock.json package-lock.json 
RUN npm ci
COPY . .
RUN npm run build      

FROM nginx
WORKDIR /usr/share/nginx/html
RUN rm -rf *

COPY --from=build /app/dist/Frontend/browser .
EXPOSE 80
ENTRYPOINT [ "nginx", "-g","daemon off;" ]