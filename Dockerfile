FROM node:20.12.2-alpine AS base
WORKDIR /usr/src/app


FROM base AS install

ADD package.json yarn.lock tsconfig.json ./
COPY ./src src

RUN yarn install --frozen-lockfile


FROM base AS release

ENV NODE_ENV=production
COPY ts-load.js ./
COPY --from=install /usr/src/app/package.json /usr/src/app/tsconfig.json ./
COPY --from=install /usr/src/app/src ./src
COPY --from=install /usr/src/app/node_modules ./node_modules

CMD ["npm", "start"]
