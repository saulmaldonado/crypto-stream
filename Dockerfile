FROM node:15.0.1-alpine

COPY package.json ./
COPY yarn.lock ./
COPY patches ./patches

RUN yarn --frozen-lockfile

COPY . .

EXPOSE 5000

CMD [ "yarn", "start:prod" ]