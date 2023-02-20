FROM node:16.19.0-alpine
WORKDIR /TrybaeBackend
COPY . .
RUN npm i
RUN npm i -g forever
EXPOSE 4455
CMD ["forever", "start", "server.js"]
