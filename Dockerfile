# The web app, served by nginx, which also forwards /api and /webhooks to the API.
#   docker build -t gaming-league-web .
#   docker run -p 8080:8080 -e API_URL=http://your-api:8080 gaming-league-web

FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/proxy.conf nginx/security-headers.conf /etc/nginx/snippets/
COPY --from=build /src/dist /usr/share/nginx/html
# Only ${API_URL} is replaced in the template, so nginx's own $variables are left alone.
ENV API_URL=http://api:8080 \
    NGINX_ENVSUBST_FILTER=^API_URL$
EXPOSE 8080
