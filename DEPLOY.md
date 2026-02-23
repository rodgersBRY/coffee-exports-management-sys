# Deployment Guide

Production deployment on a DigitalOcean Droplet using Docker Compose + Nginx + Let's Encrypt.

## Step 1 — Install Docker on the Droplet

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

## Step 2 — Open the firewall

```bash
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
```

## Step 3 — Clone the repo

```bash
git clone <your-repo-url> /opt/ceoms
cd /opt/ceoms
```

## Step 4 — Create the three env files

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Fill in `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

```bash
cp api/.env.example api/.env.prod
nano api/.env.prod
```

Key values to set:

```env
NODE_ENV=production
DB_SSL_MODE=disable               # postgres is on the same Docker network
CORS_ALLOWED_ORIGINS=https://ceoms.mawirab.com,https://api.ceoms.mawirab.com
TRUST_PROXY=true
JWT_ACCESS_SECRET=<32+ random chars>
JWT_REFRESH_SECRET=<32+ random chars>
DATA_ENCRYPTION_KEY=<base64 32-byte key>
CSRF_SECRET=<32+ random chars>
NOTIFICATIONS_CRON_ENABLED=true
```

```bash
cp web/.env.example web/.env.prod
nano web/.env.prod
```

```env
SESSION_COOKIE_SECURE=true
# CEOMS_API_URL is injected by docker-compose — don't set it here
```

## Step 5 — Point DNS and wait for propagation

In your DNS provider, add two A records:

| Hostname | Type | Value |
|---|---|---|
| `ceoms.mawirab.com` | A | `<Droplet IP>` |
| `api.ceoms.mawirab.com` | A | `<Droplet IP>` |

Verify propagation before the next step:

```bash
dig +short ceoms.mawirab.com      # should return your Droplet IP
dig +short api.ceoms.mawirab.com
```

## Step 6 — Issue SSL certificates

The nginx config references certificate files that must exist before it can start.
Pre-create the named volumes docker-compose will use, then run certbot in standalone
mode on port 80 (no other containers need to be running):

```bash
docker volume create ceoms_certbot-conf
docker volume create ceoms_certbot-www

docker run --rm \
  -p 80:80 \
  -v ceoms_certbot-conf:/etc/letsencrypt \
  -v ceoms_certbot-www:/var/www/certbot \
  certbot/certbot certonly \
  --standalone \
  --email you@youremail.com \
  --agree-tos \
  --no-eff-email \
  -d ceoms.mawirab.com \
  -d api.ceoms.mawirab.com
```

A successful run ends with: `Congratulations! Your certificate and chain have been saved`.

## Step 7 — Deploy

```bash
./deploy.sh
```

This builds both images, runs Prisma migrations, and starts all five containers
(postgres, api, web, nginx, certbot). The certbot container auto-renews certificates
every 12 hours going forward.

## Verifying everything is up

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api --tail 50
docker compose -f docker-compose.prod.yml logs web --tail 50
```

Visit `https://ceoms.mawirab.com` — you should hit the login page.

## Future deployments

From this point on, every release is just:

```bash
cd /opt/ceoms && ./deploy.sh
```
