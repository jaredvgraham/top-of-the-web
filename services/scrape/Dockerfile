FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install tsx@4.19.2 --no-save

COPY tsconfig.json ./
COPY src ./src

ENV PORT=8787
ENV NODE_ENV=production
EXPOSE 8787

CMD ["npx", "tsx", "src/server.ts"]
