FROM node:20-alpine
WORKDIR /app
COPY ca-bundle.crt /usr/local/share/ca-certificates/ccr-proxy.crt
RUN apk add --no-cache ca-certificates && update-ca-certificates
COPY package*.json ./
RUN npm install --omit=dev --cafile /etc/ssl/certs/ca-certificates.crt
COPY src ./src
EXPOSE 3001
CMD ["node", "src/index.js"]
