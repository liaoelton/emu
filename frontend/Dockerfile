FROM node:lts-alpine

WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./

RUN npm i -g npm@latest

RUN npm upgrade -g yarn
RUN yarn install --force
COPY . .
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]

