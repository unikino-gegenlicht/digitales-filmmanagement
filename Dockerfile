FROM node:20 AS build
ARG REACT_APP_OIDC_AUTHORITY
ARG REACT_APP_OIDC_CLIENT_ID

COPY . /tmp/build
WORKDIR /tmp/build
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

FROM caddy:latest
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /tmp/build/build /srv
RUN ls /srv