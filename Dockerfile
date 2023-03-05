# base image for NodeJS
FROM node:18 AS base
# working directory for the app
WORKDIR /usr/nina-the-cat


# setup everything needed for the project
FROM base AS development
# install global dependencies
COPY package.json ./
# setup production dependencies
RUN yarn install --pure-lockfile --production
RUN cp -R node_modules /tmp/node_modules

# setup dev dependencies
RUN yarn install --pure-lockfile
# copy source code
COPY . .


# typecheck and build production code
FROM development AS builder
RUN tsc --noEmit
RUN tsc --project tsconfig.json && tsc-alias -p tsconfig.json


FROM base AS release
# copy production node_modules
COPY --from=builder /tmp/node_modules ./node_modules
COPY --from=builder /usr/nina-the-cat/dist ./dist
COPY --from=builder /usr/nina-the-cat/package.json ./
CMD ["yarn", "start"]



