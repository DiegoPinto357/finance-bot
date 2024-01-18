FROM node:18.16 as base

WORKDIR /home/app

COPY . .

RUN npm i
