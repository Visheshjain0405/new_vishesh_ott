# -------- Base image --------
FROM public.ecr.aws/docker/library/node:18-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# -------- Install deps (only production) --------
COPY package*.json ./
RUN npm ci --omit=dev \
  && npm pkg set type=module

# -------- App source --------
COPY . .

# -------- Runtime --------
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:5000/health || exit 1
CMD ["npm", "start"]

