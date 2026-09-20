FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ .
RUN npm run build

FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --no-audit --no-fund
COPY server/ .
RUN npx prisma generate

FROM node:22-alpine AS production
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=server-build /app/server /app/server
COPY --from=client-build /app/client/dist/projectflow/browser /app/server/public
RUN mkdir -p /app/server/uploads
EXPOSE 8080
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed && node src/server.js"]
