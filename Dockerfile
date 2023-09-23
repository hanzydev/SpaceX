FROM node:20-alpine3.17

WORKDIR /spacex

COPY . /spacex
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD ["yarn", "preview"]