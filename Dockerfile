FROM node:12.20.2-alpine as base
EXPOSE 3000
ENV SDH_ENV=default
RUN mkdir -p /opt/node/app && chown -R node:node /opt/node
USER node
WORKDIR /opt/node
COPY ./package*.json ./
COPY ./yarn.lock ./
RUN yarn --frozen-lockfile

FROM base as dev
ENV PATH=/opt/node/node_modules/.bin/:$PATH
WORKDIR /opt/node/app
CMD [ "nodemon", "src/index.ts"]

FROM base as source
COPY . ./app/

FROM source as test
COPY --from=dev /opt/node/node_modules /opt/node/node_modules
WORKDIR /opt/node/app
RUN yarn run unit-tests

# Stage 5 (audit)
# run audit and security scanners
FROM test as audit
RUN npm audit
# aqua microscanner, which needs a token for API access
# note this isn't super secret, so we'll use an ARG here
# https://github.com/aquasecurity/microscanner
ARG MICROSCANNER_TOKEN
ADD https://get.aquasec.com/microscanner /
USER root
RUN chmod +x /microscanner
RUN apk add --no-cache ca-certificates && update-ca-certificates
USER node
RUN /microscanner $MICROSCANNER_TOKEN --continue-on-failure

FROM dev as build
COPY --chown=node:node . .
# build javascript files
RUN yarn compile

FROM base as prod
WORKDIR /opt/node/app
COPY --from=build /opt/node/app/build/ ./
CMD ["node", "src/index.js"]
