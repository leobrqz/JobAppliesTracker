FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --prefer-frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
