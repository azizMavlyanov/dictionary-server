FROM node:12.4-alpine

COPY ["./*", "/app/"]

WORKDIR /app

CMD [ "npm", "start" ]

EXPOSE 8080