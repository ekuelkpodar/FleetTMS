FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --production --legacy-peer-deps
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/main.js"]
