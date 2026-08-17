# Etapa de construcción (Build stage)
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm ci

# Copiamos el resto del código
COPY . .

# Construimos la aplicación para producción
RUN npm run build:prod

# Etapa de servidor (Serve stage)
FROM nginx:alpine

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos construidos desde la etapa anterior
# La ruta dist/veterinaria-standalone/browser es la estándar para Angular >= 17 con application builder
COPY --from=build /app/dist/veterinaria-standalone/browser /usr/share/nginx/html

# Exponemos el puerto
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
