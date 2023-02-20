FROM node:16.19.0-alpine
WORKDIR /TrybaeBackend
COPY . .
RUN npm i
EXPOSE 4455
CMD ["node", "server.js"]
