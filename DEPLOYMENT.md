# 🚀 Руководство по развертыванию Speed VPN на собственном сервере

Это руководство поможет вам развернуть проект Speed VPN на вашем собственном сервере, настроить базу данных и подключить все необходимые сервисы.

---

## 📋 Оглавление

1. [Требования](#требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Установка зависимостей](#установка-зависимостей)
4. [Настройка базы данных](#настройка-базы-данных)
5. [Настройка переменных окружения](#настройка-переменных-окружения)
6. [Развертывание Frontend](#развертывание-frontend)
7. [Развертывание Backend функций](#развертывание-backend-функций)
8. [Настройка вебхуков](#настройка-вебхуков)
9. [Настройка SSL сертификатов](#настройка-ssl-сертификатов)
10. [Мониторинг и логи](#мониторинг-и-логи)
11. [Резервное копирование](#резервное-копирование)
12. [Troubleshooting](#troubleshooting)

---

## Требования

### Минимальные требования к серверу:
- **OS:** Ubuntu 20.04 LTS или выше / Debian 11+
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 20 GB SSD
- **Network:** 100 Mbps

### Рекомендуемые требования:
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disk:** 50 GB SSD
- **Network:** 1 Gbps

### Необходимые сервисы:
- PostgreSQL 14+
- Node.js 18+ / Bun 1.0+
- Python 3.11+
- Nginx
- Certbot (для SSL)
- Docker (опционально)

---

## Подготовка сервера

### 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка необходимых пакетов

```bash
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx
```

### 3. Настройка firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5432/tcp    # PostgreSQL (если БД на том же сервере)
sudo ufw enable
```

---

## Установка зависимостей

### Node.js (через nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Bun (альтернатива npm, быстрее)

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Python 3.11

```bash
sudo apt install -y python3.11 python3.11-venv python3.11-dev
```

### PostgreSQL 14

```bash
sudo apt install -y postgresql-14 postgresql-contrib-14
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## Настройка базы данных

### 1. Создание пользователя и базы данных

```bash
sudo -u postgres psql
```

В PostgreSQL консоли:

```sql
-- Создание пользователя
CREATE USER speedvpn_user WITH PASSWORD 'your_secure_password_here';

-- Создание базы данных
CREATE DATABASE speedvpn_db OWNER speedvpn_user;

-- Выдача прав
GRANT ALL PRIVILEGES ON DATABASE speedvpn_db TO speedvpn_user;

-- Выход
\q
```

### 2. Настройка удаленного доступа (если БД на отдельном сервере)

Редактируем `postgresql.conf`:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Находим строку `listen_addresses` и меняем на:

```
listen_addresses = '*'
```

Редактируем `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Добавляем в конец:

```
# Разрешить подключение с определенного IP
host    speedvpn_db     speedvpn_user   YOUR_SERVER_IP/32    md5

# Или разрешить с любого IP (не рекомендуется для продакшена)
host    all             all             0.0.0.0/0            md5
```

Перезапускаем PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Создание строки подключения DATABASE_URL

```
postgresql://speedvpn_user:your_secure_password_here@localhost:5432/speedvpn_db

# Или для удаленной БД:
postgresql://speedvpn_user:your_secure_password_here@db_server_ip:5432/speedvpn_db
```

### 4. Применение миграций

Склонируйте проект:

```bash
cd /var/www
git clone https://github.com/your-username/speedvpn.git
cd speedvpn
```

Создайте файл `.env`:

```bash
nano .env
```

Добавьте:

```env
DATABASE_URL=postgresql://speedvpn_user:your_secure_password_here@localhost:5432/speedvpn_db
```

Примените миграции вручную:

```bash
# Подключитесь к БД
psql postgresql://speedvpn_user:your_secure_password_here@localhost:5432/speedvpn_db

# Выполните все миграции из папки db_migrations/ по порядку
\i db_migrations/V0001__initial_schema.sql
\i db_migrations/V0002__add_users_table.sql
# ... и так далее для всех файлов
```

Или используйте скрипт автоматической миграции:

```bash
for file in db_migrations/*.sql; do
  echo "Applying migration: $file"
  psql postgresql://speedvpn_user:your_secure_password_here@localhost:5432/speedvpn_db -f "$file"
done
```

---

## Настройка переменных окружения

### 1. Создание файла `.env`

```bash
cd /var/www/speedvpn
nano .env
```

### 2. Заполните все необходимые переменные:

```env
# База данных
DATABASE_URL=postgresql://speedvpn_user:your_password@localhost:5432/speedvpn_db

# Админ-панель
ADMIN_PASSWORD=your_super_secure_admin_password

# ЮKassa (платежная система)
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=live_your_secret_key

# Remnawave (VPN панель)
REMNAWAVE_API_URL=https://your-vpn-panel.com
REMNAWAVE_API_TOKEN=your_remnawave_api_token
REMNAWAVE_FUNCTION_URL=https://your-domain.com/api/remnawave
USER_SQUAD_UUIDS=uuid1,uuid2,uuid3
USER_TRAFFIC_LIMIT_GB=30
USER_TRAFFIC_STRATEGY=MONTH

# Email сервисы
RESEND_API_KEY=re_your_resend_key
UNISENDER_API_KEY=your_unisender_key

# URLs
FRONTEND_URL=https://speedvpn.io
BACKEND_URL=https://api.speedvpn.io
```

### 3. Защита файла `.env`

```bash
chmod 600 .env
```

---

## Развертывание Frontend

### 1. Установка зависимостей

```bash
cd /var/www/speedvpn
bun install
# или npm install
```

### 2. Сборка проекта

```bash
bun run build
# или npm run build
```

Результат сборки будет в папке `dist/`.

### 3. Настройка Nginx

Создайте конфигурацию:

```bash
sudo nano /etc/nginx/sites-available/speedvpn
```

Содержимое:

```nginx
server {
    listen 80;
    server_name speedvpn.io www.speedvpn.io;

    root /var/www/speedvpn/dist;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;

    # Кеширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA роутинг
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Активируем конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/speedvpn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Установка SSL сертификата

```bash
sudo certbot --nginx -d speedvpn.io -d www.speedvpn.io
```

Автоматическое обновление сертификатов:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Развертывание Backend функций

### Вариант 1: Использование Serverless платформы (рекомендуется)

Проект использует serverless архитектуру. Backend функции в папке `backend/` предназначены для запуска на:

- **Yandex Cloud Functions** (текущее решение)
- **AWS Lambda**
- **Google Cloud Functions**
- **Azure Functions**
- **Vercel Functions**
- **Netlify Functions**

#### Пример развертывания на AWS Lambda:

```bash
# Установите AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Настройте credentials
aws configure

# Для каждой функции создайте Lambda:
cd backend/payment
zip -r payment.zip .
aws lambda create-function \
  --function-name speedvpn-payment \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role \
  --handler index.handler \
  --zip-file fileb://payment.zip

# Создайте API Gateway для HTTP доступа
```

### Вариант 2: Запуск на своем сервере (Express.js wrapper)

Создайте файл `backend/server.js`:

```javascript
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Загрузка всех функций
const payment = require('./payment/index.py');
const plans = require('./plans/index.ts');
// ... остальные функции

// Роутинг
app.post('/api/payment', async (req, res) => {
  const event = {
    httpMethod: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body),
  };
  const result = await payment.handler(event, {});
  res.status(result.statusCode).send(result.body);
});

// ... остальные роуты

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
```

Создайте systemd service:

```bash
sudo nano /etc/systemd/system/speedvpn-backend.service
```

```ini
[Unit]
Description=Speed VPN Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/speedvpn/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/speedvpn/.env

[Install]
WantedBy=multi-user.target
```

Запуск:

```bash
sudo systemctl enable speedvpn-backend
sudo systemctl start speedvpn-backend
sudo systemctl status speedvpn-backend
```

### 3. Настройка Nginx для Backend API

```bash
sudo nano /etc/nginx/sites-available/speedvpn
```

Добавьте в конфигурацию:

```nginx
# Backend API
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}
```

Перезагрузите Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Настройка вебхуков

### 1. ЮKassa (платежи)

#### Создание webhook endpoint

Backend функция `payment` уже обрабатывает вебхуки. URL для webhook:

```
https://speedvpn.io/api/payment
```

#### Настройка в личном кабинете ЮKassa:

1. Зайдите в [Личный кабинет ЮKassa](https://yookassa.ru/my/)
2. Перейдите в **Настройки → HTTP-уведомления**
3. Добавьте URL: `https://speedvpn.io/api/payment`
4. Выберите события:
   - ✅ `payment.succeeded` (успешная оплата)
   - ✅ `payment.canceled` (отмена платежа)
   - ✅ `refund.succeeded` (возврат средств)

#### Проверка webhook

Создайте тестовый endpoint для проверки:

```bash
cd /var/www/speedvpn
nano test-webhook.js
```

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/payment', (req, res) => {
  console.log('Received webhook:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Webhook test server on port 3000'));
```

Запустите:

```bash
node test-webhook.js
```

Отправьте тестовый платеж из ЮKassa и проверьте логи.

### 2. Remnawave (VPN панель)

Если Remnawave поддерживает вебхуки, создайте endpoint:

```
https://speedvpn.io/api/remnawave-webhook
```

Добавьте обработчик в backend:

```python
# backend/remnawave-webhook/index.py
def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    
    # Обработка событий от Remnawave
    event_type = body.get('event')
    
    if event_type == 'user.expired':
        user_id = body.get('user_id')
        # Отключить подписку в БД
        update_user_subscription(user_id, status='expired')
    
    return {
        'statusCode': 200,
        'body': json.dumps({'status': 'ok'})
    }
```

### 3. Unisender (email)

Настройка вебхуков для отслеживания доставки email:

1. Зайдите в [Unisender личный кабинет](https://cp.unisender.com/)
2. **Настройки → Вебхуки**
3. Добавьте URL: `https://speedvpn.io/api/email-webhook`
4. События:
   - ✅ Доставлено
   - ✅ Открыто
   - ✅ Нажата ссылка
   - ✅ Отписка

### 4. Безопасность вебхуков

#### Проверка подписи ЮKassa:

```python
import hmac
import hashlib

def verify_yookassa_signature(body, signature, secret_key):
    expected = hmac.new(
        secret_key.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

# В handler:
signature = headers.get('x-yookassa-signature')
if not verify_yookassa_signature(body, signature, YOOKASSA_SECRET_KEY):
    return {'statusCode': 401, 'body': 'Invalid signature'}
```

#### IP whitelist

Ограничьте доступ к вебхукам только с IP ЮKassa:

```nginx
# В конфигурации Nginx
location /api/payment {
    allow 185.71.76.0/27;
    allow 185.71.77.0/27;
    allow 77.75.153.0/25;
    deny all;
    
    proxy_pass http://localhost:3000/api/payment;
}
```

---

## Настройка SSL сертификатов

### 1. Автоматические сертификаты через Certbot

```bash
sudo certbot --nginx -d speedvpn.io -d www.speedvpn.io -d api.speedvpn.io
```

### 2. Wildcard сертификаты (для поддоменов)

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges=dns \
  -d speedvpn.io \
  -d "*.speedvpn.io"
```

Добавьте TXT запись в DNS как указано в инструкции.

### 3. Проверка автообновления

```bash
sudo certbot renew --dry-run
```

### 4. Настройка крон-задачи для обновления

```bash
sudo crontab -e
```

Добавьте:

```
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## Мониторинг и логи

### 1. Логи Nginx

```bash
# Логи доступа
sudo tail -f /var/log/nginx/access.log

# Логи ошибок
sudo tail -f /var/log/nginx/error.log
```

### 2. Логи Backend

```bash
sudo journalctl -u speedvpn-backend -f
```

### 3. Логи PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 4. Мониторинг ресурсов

Установите htop:

```bash
sudo apt install htop
htop
```

### 5. Настройка Prometheus + Grafana (опционально)

```bash
# Установка Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*
./prometheus --config.file=prometheus.yml

# Установка Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*
./node_exporter

# Установка Grafana
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana
sudo systemctl start grafana-server
```

Grafana доступна на `http://your-server:3000` (логин: admin, пароль: admin)

---

## Резервное копирование

### 1. Backup базы данных (ежедневный)

Создайте скрипт `/root/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/speedvpn"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump postgresql://speedvpn_user:password@localhost:5432/speedvpn_db | gzip > "$BACKUP_DIR/speedvpn_db_$DATE.sql.gz"

# Удаление старых backup (старше 7 дней)
find $BACKUP_DIR -name "speedvpn_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: speedvpn_db_$DATE.sql.gz"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /root/backup-db.sh
```

Добавьте в cron:

```bash
sudo crontab -e
```

```
0 2 * * * /root/backup-db.sh >> /var/log/speedvpn-backup.log 2>&1
```

### 2. Восстановление из backup

```bash
gunzip -c /var/backups/speedvpn/speedvpn_db_20231103.sql.gz | psql postgresql://speedvpn_user:password@localhost:5432/speedvpn_db
```

### 3. Backup файлов проекта

```bash
tar -czf /var/backups/speedvpn/speedvpn_files_$(date +%Y%m%d).tar.gz \
  /var/www/speedvpn \
  /etc/nginx/sites-available/speedvpn \
  /etc/systemd/system/speedvpn-backend.service
```

---

## Troubleshooting

### Проблема 1: Не запускается Frontend

**Ошибка:** `Cannot GET /`

**Решение:**
```bash
# Проверьте содержимое dist/
ls -la /var/www/speedvpn/dist

# Пересоберите проект
cd /var/www/speedvpn
bun run build

# Проверьте права доступа
sudo chown -R www-data:www-data /var/www/speedvpn/dist
```

### Проблема 2: Backend возвращает 500

**Ошибка:** Internal Server Error

**Решение:**
```bash
# Проверьте логи
sudo journalctl -u speedvpn-backend -n 50

# Проверьте переменные окружения
systemctl show speedvpn-backend | grep Environment

# Перезапустите сервис
sudo systemctl restart speedvpn-backend
```

### Проблема 3: Не работают платежи

**Ошибка:** Webhook не получен

**Решение:**
```bash
# Проверьте доступность endpoint
curl -X POST https://speedvpn.io/api/payment \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверьте настройки ЮKassa в личном кабинете
```

### Проблема 4: Не подключается к БД

**Ошибка:** `connection refused` или `authentication failed`

**Решение:**
```bash
# Проверьте статус PostgreSQL
sudo systemctl status postgresql

# Проверьте pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Проверьте пользователя
sudo -u postgres psql
\du

# Тест подключения
psql postgresql://speedvpn_user:password@localhost:5432/speedvpn_db
```

### Проблема 5: SSL сертификат не обновляется

**Решение:**
```bash
# Проверьте таймер certbot
sudo systemctl status certbot.timer

# Ручное обновление
sudo certbot renew --dry-run

# Проверьте логи
sudo cat /var/log/letsencrypt/letsencrypt.log
```

---

## Дополнительные настройки

### 1. CDN (Cloudflare)

1. Зарегистрируйтесь на [Cloudflare](https://www.cloudflare.com/)
2. Добавьте домен speedvpn.io
3. Смените NS записи у регистратора домена
4. Включите **Proxy** для записей A/AAAA
5. Настройте SSL: **Full (strict)**
6. Включите кеширование статики

### 2. Балансировка нагрузки (если несколько серверов)

Настройте Nginx как load balancer:

```nginx
upstream backend_servers {
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;
}

server {
    location /api/ {
        proxy_pass http://backend_servers;
    }
}
```

### 3. Rate limiting (защита от DDoS)

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

---

## Управление настройками через админку

После развертывания вы можете управлять всеми настройками проекта через админ-панель:

1. Зайдите на `https://speedvpn.io/admin`
2. Введите пароль администратора (из `ADMIN_PASSWORD`)
3. Перейдите на вкладку **"Проект"**
4. Нажмите **"Редактировать"**
5. Измените нужные настройки (DATABASE_URL, API ключи и т.д.)
6. Нажмите **"Сохранить"**

Все изменения сохраняются в базе данных и применяются автоматически!

---

## Контакты и поддержка

- **Документация проекта:** [https://speedvpn.io/docs](https://speedvpn.io/docs)
- **GitHub Issues:** [https://github.com/your-repo/issues](https://github.com/your-repo/issues)
- **Telegram сообщество:** [https://t.me/+QgiLIa1gFRY4Y2Iy](https://t.me/+QgiLIa1gFRY4Y2Iy)

---

## Лицензия

MIT License - см. файл LICENSE в корне проекта.

---

**Удачи с развертыванием! 🚀**
