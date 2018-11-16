FROM node:latest
ARG port=3000

RUN mkdir /usr/app
RUN chmod a+rwx /usr/app

WORKDIR /usr/app
ADD . .

# RUN npm install

ENV PORT=${port}
CMD npm install && node index.js
EXPOSE ${port}
