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
FROM node
WORKDIR /usr/src/app

# Copy built Angular app from Stage 1
COPY --from=build /usr/src/app/dist /usr/src/app/dist
EXPOSE 4200
CMD ["npm", "start"]
