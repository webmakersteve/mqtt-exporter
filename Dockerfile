FROM node:10.6.0

COPY package.json .
COPY package-lock.json .

RUN npm install --production

FROM node:10.6.0-slim

WORKDIR /usr/local/water-monitor

COPY --from=0 node_modules/ node_modules
COPY --from=0 package.json .

COPY config config
COPY lib lib
COPY index.js .

CMD [ "/usr/local/bin/npm", "start" ]
