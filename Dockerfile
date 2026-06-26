FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

# Installeer dependencies
COPY package*.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm install

# Kopieer broncode en bouw de app
COPY . .
RUN npm run build

# Zorg dat de uploads-map bestaat
RUN mkdir -p /data/uploads

ENV NODE_ENV=production
ENV UPLOADS_DIR=/data/uploads

EXPOSE 8080

RUN chmod +x /app/server/start.sh
CMD ["/app/server/start.sh"]
