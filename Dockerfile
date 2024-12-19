FROM node:18.16-alpine as base

WORKDIR /home/node/app

COPY . .

RUN npm i
