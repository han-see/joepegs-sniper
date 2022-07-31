# Pull official base image as build to use in later stage
FROM node:alpine AS build

# Workdir
WORKDIR /app

# install app dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

# copy application to the folder
COPY . .

# build the app
RUN npm run build
RUN npm run prune:production

# build the actual image here
FROM node:alpine
WORKDIR /app
COPY --from=build /app/. .
RUN npm ci --omit=dev

# Run the app from the image
CMD ["npm", "run", "test-main"]
