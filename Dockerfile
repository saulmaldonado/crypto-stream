FROM node:alpine

COPY package.json ./
COPY yarn.lock ./
COPY patches ./patches

RUN yarn --frozen-lockfile

COPY . .

EXPOSE 5000

CMD [ "yarn", "start" ]