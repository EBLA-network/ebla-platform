FROM node:16-slim

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_PREFLIGHT_CHECK true

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
COPY packages/ebla-ui/package.json /app/packages/ebla-ui/
COPY services/node-status/package.json /app/services/node-status/

RUN yarn install

COPY tsconfig.json /app/

COPY packages/ebla-ui /app/packages/ebla-ui
COPY services/node-status /app/services/node-status

RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @ebla-network/taraxa-ui build
RUN SKIP_PREFLIGHT_CHECK=true yarn workspace @ebla-network/taraxa-node-status build

CMD ["yarn", "workspace", "@ebla-network/taraxa-node-status", "start"]