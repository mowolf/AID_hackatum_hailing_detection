FROM node:latest
ARG port=3000

RUN mkdir /usr/app
RUN chmod a+rwx /usr/app

WORKDIR /usr/app
ADD . .

RUN mkdir /usr/cache
RUN chmod a+rwx /usr/cache
ENV YARN_CACHE_FOLDER=/usr/cache

# RUN yarn install

# Install yarn from the local .tgz
RUN mkdir -p /opt
ADD yarn-v1.12.3.tar.gz /opt/
ENV PATH "$PATH:/opt/yarn/bin"

# Install packages using Yarn
ADD package.json /tmp/package.json

ENV PORT=${port}
CMD yarn install && yarn watch
EXPOSE ${port}
