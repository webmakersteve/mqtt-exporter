FROM node:10.6.0-slim

WORKDIR /usr/local/water-monitor

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY config config
COPY data data
COPY lib lib
COPY index.js .

CMD [ "/usr/local/bin/npm", "start" ]
