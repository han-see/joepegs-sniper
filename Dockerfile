# Pull official base image as base to use in later stage
FROM node:alpine AS base

# Workdir
WORKDIR /app

# install app dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
# delete this eventually
RUN npm install

# dev
FROM base as dev
RUN npm ci && npm run build
COPY . .
CMD ["npm", "run", "test-main"]

FROM base as prod
RUN npm ci && npm run build && npm run prune: production

# copy application to the folder
COPY . .

# build the app
RUN npm run build
RUN npm run prune:production

# build the actual image here
FROM node:alpine
WORKDIR /app
COPY --from=base /app/. .
RUN npm ci --omit=dev

# Run the app from the image
CMD ["npm", "run", "test-main"]
