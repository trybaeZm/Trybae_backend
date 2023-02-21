FROM node:16.19.0-alpine

WORKDIR /app

COPY . ./

RUN npm install 

EXPOSE 4455 4456 4457

CMD [ "node", "server.js" ]

