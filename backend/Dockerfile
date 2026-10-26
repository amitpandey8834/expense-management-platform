
FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force

COPY --chown=node:node ./src ./src

USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
