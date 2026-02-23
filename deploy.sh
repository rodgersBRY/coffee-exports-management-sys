#!/usr/bin/env bash
# Usage: ./deploy.sh
#
# Pulls the latest code, rebuilds images, and restarts services with zero manual steps.
# Run this script for every subsequent deployment after initial setup.
#
# ── Initial server setup (run once on a fresh Droplet) ──────────────────────
#
#   1. Install Docker + Docker Compose plugin
#        curl -fsSL https://get.docker.com | sh
#        sudo usermod -aG docker $USER && newgrp docker
#
#   2. Clone the repo and cd into it
#
#   3. Create env files
#        cp .env.prod.example          .env.prod          && nano .env.prod
#        cp api/.env.example           api/.env.prod      && nano api/.env.prod
#        cp web/.env.example           web/.env.prod      && nano web/.env.prod
#
#      Key values to set in api/.env.prod:
#        NODE_ENV=production
#        DB_SSL_MODE=disable           # postgres is on the same Docker network
#        CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
#        SESSION_COOKIE_SECURE=true
#        TRUST_PROXY=true
#        JWT_ACCESS_SECRET=<32+ random chars>
#        JWT_REFRESH_SECRET=<32+ random chars>
#        DATA_ENCRYPTION_KEY=<base64 32-byte key>
#        CSRF_SECRET=<32+ random chars>
#        NOTIFICATIONS_CRON_ENABLED=true
#
#      Key values to set in web/.env.prod:
#        SESSION_COOKIE_SECURE=true
#        # CEOMS_API_URL is injected by docker-compose (http://api:4000), leave it out
#
#   4. Point your DNS A records:
#        app.yourdomain.com  →  <Droplet IP>
#        api.yourdomain.com  →  <Droplet IP>   (optional)
#
#   5. Start only nginx on HTTP so Certbot can validate your domain
#        # Temporarily use an HTTP-only nginx config
#        docker compose -f docker-compose.prod.yml --env-file .env.prod up -d nginx postgres
#
#   6. Issue SSL certificates (replace domains)
#        docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm certbot \
#          certonly --webroot --webroot-path /var/www/certbot \
#          --email you@yourdomain.com --agree-tos --no-eff-email \
#          -d app.yourdomain.com -d api.yourdomain.com
#
#   7. Replace nginx/default.conf placeholder domains, then run this script:
#        ./deploy.sh
#
# ── Subsequent deployments ───────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()   { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}   $*"; }
error() { echo -e "${RED}[error]${NC}  $*"; exit 1; }

[[ -f ".env.prod" ]]     || error "Missing .env.prod — see setup instructions above"
[[ -f "api/.env.prod" ]] || error "Missing api/.env.prod — see setup instructions above"
[[ -f "web/.env.prod" ]] || error "Missing web/.env.prod — see setup instructions above"

log "Pulling latest code..."
git pull origin main

log "Building images..."
docker compose -f docker-compose.prod.yml --env-file .env.prod build

log "Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans

log "Cleaning up unused images..."
docker image prune -f

log "Service status:"
docker compose -f docker-compose.prod.yml ps
