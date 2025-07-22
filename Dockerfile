# MAZLABZ Enterprise Terminal - Production Dockerfile
# Multi-stage build optimized for Cloud Run

# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:alpine
LABEL maintainer="jack.mazzini@mazlabz.com"
LABEL description="MAZLABZ Enterprise Terminal Interface"
LABEL version="1.0.0"

COPY --from=build /app/dist/ /usr/share/nginx/html/

# SPA routing config
RUN echo 'server {' > /etc/nginx/conf.d/default.conf \
 && echo '    listen 8080;' >> /etc/nginx/conf.d/default.conf \
 && echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf \
 && echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
 && echo '    index index.html;' >> /etc/nginx/conf.d/default.conf \
 && echo '    location / {' >> /etc/nginx/conf.d/default.conf \
 && echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf \
 && echo '    }' >> /etc/nginx/conf.d/default.conf \
 && echo '    # Security headers' >> /etc/nginx/conf.d/default.conf \
 && echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf \
 && echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf \
 && echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf \
 && echo '    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;' >> /etc/nginx/conf.d/default.conf \
 && echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
