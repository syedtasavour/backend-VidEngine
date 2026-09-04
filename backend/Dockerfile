FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Dependencies are copied on their own so this layer is only rebuilt when the
# manifests change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

# Multer writes uploads to ./public/temp before they go to Cloudinary, so that
# directory has to exist and be writable by the unprivileged user we drop to.
RUN mkdir -p public/temp && chown -R node:node /app

USER node
EXPOSE 8000

CMD ["node", "src/index.js"]
