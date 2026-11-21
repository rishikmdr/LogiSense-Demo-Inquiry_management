FROM node:20-alpine
WORKDIR /app
COPY ca-bundle.crt /tmp/ccr-ca.crt
RUN cat /tmp/ccr-ca.crt >> /etc/ssl/certs/ca-certificates.crt
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 3001
CMD ["node", "src/index.js"]
