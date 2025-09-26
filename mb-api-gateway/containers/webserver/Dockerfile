# This docker file is for mb-api-gateway

FROM ubuntu:22.04
ENV TZ=America/Vancouver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 4770
EXPOSE 4771
EXPOSE 4774

# Ubuntu updates
# RUN apt-get -y update
ENV DEBIAN_FRONTEND=noninteractive

ENV APP_BASE=/app/K8S/moviebrain/mb-api-gateway/containers/webserver

RUN mkdir -p ${APP_BASE}

# NVM, Node, npm
ENV NODE_VERSION=18.19.1
RUN apt-get -y update && apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# RUN apt-get -y update

RUN apt-get install -y default-mysql-client default-libmysqlclient-dev

COPY ./moviebrain/mb-api-gateway/containers/webserver/package.json ${APP_BASE}

WORKDIR ${APP_BASE}
RUN npm install
WORKDIR /

RUN mkdir -p /app/K8S/moviebrain/mb-common/

# Copy mb-common folder to its correct path
COPY ./moviebrain/mb-common/ /app/K8S/moviebrain/mb-common/

# Copy webserver source into its correct path
COPY ./moviebrain/mb-api-gateway/containers/webserver/ ${APP_BASE}


WORKDIR ${APP_BASE}
CMD ["node", "index.js"]
# CMD ["sleep", "infinity"]


