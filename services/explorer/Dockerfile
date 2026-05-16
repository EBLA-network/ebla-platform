# build environment
FROM node:16.18.1-alpine as build

# Default replace vars for entrypoint
# Should be removed after we able to configure at runtime
ARG REACT_APP_MAINNET_API_HOST=REACT_APP_MAINNET_API_HOST_STRING_REPLACE
ARG REACT_APP_TESTNET_API_HOST=REACT_APP_TESTNET_API_HOST_STRING_REPLACE
ARG REACT_APP_DEVNET_API_HOST=REACT_APP_DEVNET_API_HOST_STRING_REPLACE
ARG REACT_APP_DISPLAY_TXES_FOR_LAST_BLOCK=REACT_APP_DISPLAY_TXES_FOR_LAST_BLOCK_STRING_REPLACE
ARG REACT_APP_TARAXA_MAINNET_PROVIDER=REACT_APP_TARAXA_MAINNET_PROVIDER_STRING_REPLACE
ARG REACT_APP_TARAXA_TESTNET_PROVIDER=REACT_APP_TARAXA_TESTNET_PROVIDER_STRING_REPLACE
ARG REACT_APP_TARAXA_DEVNET_PROVIDER=REACT_APP_TARAXA_DEVNET_PROVIDER_STRING_REPLACE
ARG REACT_APP_OVERRIDE_RPC_PROVIDER=REACT_APP_OVERRIDE_RPC_PROVIDER_STRING_REPLACE
ARG REACT_APP_OVERRIDE_GRAPHQL=REACT_APP_OVERRIDE_GRAPHQL_STRING_REPLACE
ARG REACT_APP_OVERRIDE_API=REACT_APP_OVERRIDE_API_STRING_REPLACE

RUN apk --no-cache add --update python3 make g++\
    --virtual .build_deps \
    build-base

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY packages/ebla-ui/package.json /app/packages/ebla-ui/
COPY packages/explorer-shared/package.json /app/packages/explorer-shared/
COPY services/explorer/package.json /app/services/explorer/

RUN yarn install

COPY tsconfig.json /app/
COPY .prettierignore /app/
COPY .prettierrc.js /app/
COPY .eslintignore /app/
COPY .eslintrc.js /app/

COPY packages/ebla-ui /app/packages/ebla-ui
COPY packages/explorer-shared /app/packages/explorer-shared
COPY services/explorer /app/services/explorer

RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @ebla-network/taraxa-ui build
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @ebla-network/explorer-shared build
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @ebla-network/explorer build

# nginx
FROM nginx:1.25.1-alpine

COPY services/explorer/docker-files/nginx.conf /etc/nginx/conf.d/default.conf
COPY services/explorer/docker-files/entrypoint.sh /entrypoint.sh

COPY --from=build /app/services/explorer/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
