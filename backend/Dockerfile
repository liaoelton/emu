FROM node:lts AS builder

WORKDIR /code

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:lts-alpine

WORKDIR /code

COPY --from=builder /code/package.json /code/yarn.lock ./
COPY --from=builder /code/dist ./dist

RUN yarn install --frozen-lockfile --production

EXPOSE 3001

HEALTHCHECK --interval=30s \
  CMD node dist/src/healthcheck.js

CMD ["yarn", "start"]