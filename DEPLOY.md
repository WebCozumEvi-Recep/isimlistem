# Sunucu Kurulumu (Ubuntu + Node + PostgreSQL + Nginx + PM2 + Cloudflare)

Hedef: `167.233.129.183` üzerinde `isimlistem.com` yayını.
Cloudflare SSL modu: **Full (strict)** → sunucuda Cloudflare Origin sertifikası.

> Aşağıdaki komutları SSH ile sunucuda çalıştırın. `isimlistem.com` yazan yerleri
> kendi alan adınızla değiştirin.

## 1. Bağlan ve sistemi güncelle

```bash
ssh root@167.233.129.183

apt update && apt upgrade -y
apt install -y curl git ufw
```

## 2. Güvenlik duvarı (Cloudflare proxy arkasında 80/443 + SSH)

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
```

## 3. Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v && npm -v
npm install -g pm2
```

## 4. PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Veritabanı ve kullanıcı oluştur (PAROLAYI değiştir):
sudo -u postgres psql <<'SQL'
CREATE USER isimlistem WITH PASSWORD 'GUCLU_PAROLA_BURAYA';
CREATE DATABASE isimlistem OWNER isimlistem;
GRANT ALL PRIVILEGES ON DATABASE isimlistem TO isimlistem;
SQL
```

## 5. Uygulamayı çek ve kur

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/WebCozumEvi-Recep/isimlistem.git
cd isimlistem

# .env oluştur:
cat > .env <<'ENV'
DATABASE_URL="postgresql://isimlistem:GUCLU_PAROLA_BURAYA@localhost:5432/isimlistem?schema=public"
AUTH_SECRET="BURAYA_OPENSSL_ILE_URETILEN_ANAHTAR"
ENV

# Güçlü AUTH_SECRET üret ve .env'e elle yapıştır:
openssl rand -base64 48

npm ci
npx prisma migrate deploy   # ilk kez tablo yoksa: npx prisma db push
npm run build
```

İsterseniz demo hesapları için seed (opsiyonel, canlıda önerilmez):
```bash
npm run db:seed
```

## 6. PM2 ile başlat

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # çıktıdaki komutu kopyalayıp çalıştırın (boot'ta otomatik başlar)
```

Test: `curl -I http://localhost:3000` → 307/200 dönmeli.

## 7. Cloudflare Origin Sertifikası (Full strict için)

Cloudflare panel → **SSL/TLS → Origin Server → Create Certificate**
(Hostlar: `isimlistem.com, *.isimlistem.com`). İki metni sunucuya kaydedin:

```bash
mkdir -p /etc/ssl/cloudflare
nano /etc/ssl/cloudflare/isimlistem.pem   # "Origin Certificate" içeriği
nano /etc/ssl/cloudflare/isimlistem.key   # "Private Key" içeriği
chmod 600 /etc/ssl/cloudflare/isimlistem.key
```

SSL/TLS şifreleme modunu **Full (strict)** seçin.

## 8. Nginx reverse proxy

```bash
apt install -y nginx
nano /etc/nginx/sites-available/isimlistem
```

İçerik:

```nginx
server {
    listen 80;
    server_name isimlistem.com www.isimlistem.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name isimlistem.com www.isimlistem.com;

    ssl_certificate     /etc/ssl/cloudflare/isimlistem.pem;
    ssl_certificate_key /etc/ssl/cloudflare/isimlistem.key;

    client_max_body_size 10M;   # Excel içe aktarma için

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Etkinleştir:

```bash
ln -s /etc/nginx/sites-available/isimlistem /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

## 9. Cloudflare DNS

- `A` kaydı: `isimlistem.com → 167.233.129.183` (Proxy: turuncu bulut AÇIK)
- `A` veya `CNAME`: `www → isimlistem.com` (Proxy açık)

## 10. Doğrula

`https://isimlistem.com` → giriş sayfası açılmalı.
İlk kayıt olan kullanıcı **ADMIN** (firma yöneticisi) olur.

---

## Güncelleme (yeni sürüm deploy)

```bash
cd /var/www/isimlistem
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 reload isimlistem
```
