FROM node:20-alpine AS build
COPY ca-bundle.crt /usr/local/share/ca-certificates/ccr-proxy.crt
RUN apk add --no-cache ca-certificates && update-ca-certificates
WORKDIR /app
COPY package*.json ./
RUN npm install --cafile /etc/ssl/certs/ca-certificates.crt
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
