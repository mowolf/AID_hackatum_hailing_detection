FROM node:latest
ARG port=5000

RUN mkdir /usr/app
RUN chmod a+rwx /usr/app

WORKDIR /usr/app
ADD . .

RUN mkdir -p /usr/.npm
RUN chmod a+rwx /usr/.npm
ENV NPM_CONFIG_CACHE=/usr/.npm

# RUN npm install

ENV PORT=${port}
CMD npm install && npm start
EXPOSE ${port}
