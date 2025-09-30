# -------- Build stage --------
FROM public.ecr.aws/docker/library/node:18-alpine AS build
WORKDIR /app
ENV CI=true
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_BASE_PATH
ARG PUBLIC_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_BASE_PATH=${REACT_APP_BASE_PATH}
ENV PUBLIC_URL=${PUBLIC_URL}
RUN npm run build

# -------- Runtime (nginx) --------
FROM public.ecr.aws/nginx/nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .
# default.conf will be provided via compose mount or baked-in
EXPOSE 80

# No CMD override; use nginx default

