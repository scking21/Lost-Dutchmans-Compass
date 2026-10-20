FROM node:24.19.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node server ./server
COPY --chown=node:node public ./public
COPY --chown=node:node LICENSE THIRD_PARTY_NOTICES.md ./
USER node
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
