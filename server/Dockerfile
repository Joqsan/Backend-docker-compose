FROM node

ARG DB_HOST
ARG DB_NAME
ARG DB_PORT
ARG SERVER_PORT

ENV DB_HOST ${DB_HOST}
ENV DB_NAME ${DB_NAME}
ENV DB_PORT ${DB_PORT}
ENV SERVER_PORT ${SERVER_PORT}
ENV DEBUG server

WORKDIR /usr/src/app

COPY package.json ./

COPY tsconfig.json ./

RUN npm install

COPY server.ts ./

CMD ["npx", "ts-node", "./server.ts"]
