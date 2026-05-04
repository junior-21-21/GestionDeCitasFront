# ===========================================
# PetyZoos Frontend — Multi-stage Build
# Stage 1: Build Angular app
# Stage 2: Serve with Nginx
# ===========================================

# --- STAGE 1: BUILD ---
FROM node:22-alpine AS build

WORKDIR /app

# Copiar package files primero (cache de dependencias)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente y construir
COPY . .
RUN npm run build:prod

# --- STAGE 2: SERVE ---
FROM nginx:alpine AS production

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar config personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular
# Angular 20 genera en dist/<project-name>/browser/
COPY --from=build /app/dist/veterinaria-standalone/browser /usr/share/nginx/html

# Puerto expuesto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
