# 🔒 Настройка SSL для домена и субдомена

## 📋 Что нужно сделать

Для работы сайта с HTTPS нужны SSL сертификаты для:
1. **Основного домена**: `yourdomain.com` (фронтенд)
2. **Субдомена API**: `api.yourdomain.com` (backend)

---

## Шаг 1: Настройте DNS записи

Зайдите в панель вашего DNS провайдера (Cloudflare, Timeweb, Reg.ru и т.д.) и добавьте:

```
Тип: A    Имя: @              Значение: IP_вашего_сервера    TTL: Auto
Тип: A    Имя: api            Значение: IP_вашего_сервера    TTL: Auto
```

**Пример для конкретного IP:**
```
A запись:     yourdomain.com        → 95.123.45.67
A запись:     api.yourdomain.com    → 95.123.45.67
```

**Проверьте что DNS применились (ждите 5-10 минут):**

```bash
dig yourdomain.com
dig api.yourdomain.com
```

---

## Шаг 2: Установите Certbot на сервере

```bash
# Подключитесь к серверу по SSH
ssh root@ваш_IP

# Установите Certbot
apt update
apt install certbot python3-certbot-nginx -y
```

---

## Шаг 3: Получите SSL сертификаты

### Вариант A: Отдельные сертификаты (рекомендуется)

**Для основного домена:**

```bash
certbot certonly --nginx \
  -d yourdomain.com \
  --email your-email@gmail.com \
  --agree-tos \
  --non-interactive
```

Сертификаты будут здесь:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

**Для субдомена API:**

```bash
certbot certonly --nginx \
  -d api.yourdomain.com \
  --email your-email@gmail.com \
  --agree-tos \
  --non-interactive
```

Сертификаты будут здесь:
- `/etc/letsencrypt/live/api.yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/api.yourdomain.com/privkey.pem`

### Вариант B: Один сертификат для обоих доменов

```bash
certbot certonly --nginx \
  -d yourdomain.com \
  -d api.yourdomain.com \
  --email your-email@gmail.com \
  --agree-tos \
  --non-interactive
```

Оба домена будут в одном сертификате:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

---

## Шаг 4: Проверьте права доступа

```bash
# Nginx в Docker должен иметь доступ к сертификатам
chmod 755 /etc/letsencrypt/live/
chmod 755 /etc/letsencrypt/archive/
chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem
chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem
chmod 644 /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
chmod 600 /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

---

## Шаг 5: Обновите .env файл

```bash
nano .env
```

Раскомментируйте и замените на ваш домен:

```env
# Было:
# VITE_API_URL=https://api.yourdomain.com
# FRONTEND_URL=https://yourdomain.com
# BACKEND_URL=https://api.yourdomain.com

# Стало (ваш реальный домен):
VITE_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

---

## Шаг 6: Обновите Nginx конфигурацию

```bash
nano nginx/nginx.conf
```

Найдите и замените все `yourdomain.com` на ваш реальный домен:

```nginx
# Было:
server_name yourdomain.com;
server_name api.yourdomain.com;

# Стало (пример):
server_name example.com;
server_name api.example.com;
```

Также проверьте пути к сертификатам:

```nginx
# Для основного домена
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Для субдомена API
ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
```

---

## Шаг 7: Перезапустите Docker Compose

```bash
docker compose down
docker compose up -d --build
```

---

## Шаг 8: Проверьте работу HTTPS

```bash
# Проверьте основной домен
curl https://yourdomain.com

# Проверьте API субдомен
curl https://api.yourdomain.com/health

# Должен вернуть JSON:
# {"status":"ok"}
```

Откройте в браузере:
- `https://yourdomain.com` - должен показать сайт с зеленым замком
- `https://api.yourdomain.com/health` - должен показать `{"status":"ok"}`

---

## 🔄 Автоматическое обновление SSL

Let's Encrypt сертификаты действуют 90 дней. Certbot автоматически их обновляет.

**Проверьте автообновление:**

```bash
# Тестовое обновление (без изменений)
certbot renew --dry-run

# Проверьте таймер автообновления
systemctl status certbot.timer
```

**Если таймер не активен, включите:**

```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

**После обновления сертификатов нужно перезагрузить Nginx:**

```bash
# Создайте hook для автоматической перезагрузки
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
docker compose -f /root/beauty-website-project/docker-compose.yml restart nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

---

## 🛠️ Решение проблем

### Проблема: "Connection refused" при получении сертификата

**Причина:** Порты 80/443 не открыты или Nginx уже запущен.

**Решение:**

```bash
# Остановите Docker Compose
docker compose down

# Проверьте что порты свободны
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Получите сертификат
certbot certonly --standalone -d yourdomain.com

# Запустите Docker Compose
docker compose up -d
```

### Проблема: "Permission denied" в логах Nginx

**Решение:**

```bash
# Дайте права доступа к сертификатам
chmod 755 /etc/letsencrypt/live/
chmod 755 /etc/letsencrypt/archive/
chmod -R 755 /etc/letsencrypt/

# Перезапустите Nginx
docker compose restart nginx
```

### Проблема: DNS записи не применяются

**Решение:**

```bash
# Проверьте DNS
dig yourdomain.com
dig api.yourdomain.com

# Очистите DNS кеш (если нужно)
systemd-resolve --flush-caches

# Подождите 10-15 минут и повторите
```

### Проблема: Сертификат не обновляется автоматически

**Решение:**

```bash
# Проверьте логи Certbot
journalctl -u certbot.timer -n 50

# Ручное обновление
certbot renew

# Перезапустите таймер
systemctl restart certbot.timer
```

---

## 📞 Нужна помощь?

- **Сообщество**: https://t.me/+QgiLIa1gFRY4Y2Iy
- **Документация Certbot**: https://certbot.eff.org/
- **Let's Encrypt статус**: https://letsencrypt.status.io/

---

## ✅ Чеклист настройки SSL

- [ ] DNS записи созданы (A записи для @ и api)
- [ ] DNS применились (проверено через `dig`)
- [ ] Certbot установлен
- [ ] Сертификат для `yourdomain.com` получен
- [ ] Сертификат для `api.yourdomain.com` получен
- [ ] Права доступа к сертификатам настроены
- [ ] `.env` файл обновлен с реальным доменом
- [ ] `nginx/nginx.conf` обновлен с реальным доменом
- [ ] Docker Compose перезапущен
- [ ] HTTPS работает на обоих доменах
- [ ] Автообновление сертификатов настроено
