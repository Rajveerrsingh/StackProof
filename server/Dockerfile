FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=4721
EXPOSE 4721
CMD ["node", "src/index.js"]
