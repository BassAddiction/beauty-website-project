# 🐳 Развертывание Speed VPN через Docker Compose

Быстрое развертывание всего проекта одной командой через Docker!

---

## 📦 Что включено

Docker Compose запускает все необходимые сервисы:

- **Frontend** - React SPA (Nginx)
- **Backend API** - Node.js сервер с Python/TypeScript функциями
- **PostgreSQL** - База данных
- **Redis** - Кеширование (опционально)
- **Adminer** - Веб-интерфейс для БД (опционально, только для разработки)

---

## 🚀 Быстрый старт (5 минут)

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/speedvpn.git
cd speedvpn
```

### 2. Настройте переменные окружения

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте файл
nano .env
```

Минимально необходимо изменить:
- `POSTGRES_PASSWORD` — пароль для БД
- `ADMIN_PASSWORD` — пароль админ-панели
- `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` — для приема платежей

### 3. Соберите frontend

```bash
bun install
bun run build
```

Или с npm:

```bash
npm install
npm run build
```

### 4. Запустите все сервисы

```bash
docker-compose up -d
```

### 5. Готово! 🎉

Откройте в браузере:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Adminer (БД):** http://localhost:8080 (профиль: `debug`)

---

## 📝 Подробные команды

### Запуск сервисов

```bash
# Запустить все сервисы в фоне
docker-compose up -d

# Запустить с логами в консоли
docker-compose up

# Запустить только определенные сервисы
docker-compose up -d postgres nginx backend

# Запустить с профилем debug (включает Adminer)
docker-compose --profile debug up -d
```

### Остановка сервисов

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (ВНИМАНИЕ: удаляет данные БД!)
docker-compose down -v

# Остановить определенный сервис
docker-compose stop backend
```

### Просмотр логов

```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs postgres
docker-compose logs nginx

# Следить за логами в реальном времени
docker-compose logs -f backend

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart backend

# Пересобрать и перезапустить
docker-compose up -d --build backend
```

### Проверка статуса

```bash
# Статус всех сервисов
docker-compose ps

# Использование ресурсов
docker stats
```

---

## 🔧 Настройка для production

### 1. SSL сертификаты

#### Получение через Let's Encrypt (рекомендуется)

```bash
# Установите certbot
sudo apt install certbot

# Остановите Nginx
docker-compose stop nginx

# Получите сертификат
sudo certbot certonly --standalone \
  -d speedvpn.io \
  -d www.speedvpn.io

# Скопируйте сертификаты в проект
sudo cp /etc/letsencrypt/live/speedvpn.io/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/speedvpn.io/privkey.pem nginx/ssl/

# Запустите Nginx
docker-compose start nginx
```

#### Или используйте свои сертификаты

Поместите файлы в `nginx/ssl/`:
- `fullchain.pem` - сертификат
- `privkey.pem` - приватный ключ

Раскомментируйте SSL блок в `nginx/nginx.conf`:

```bash
nano nginx/nginx.conf
```

### 2. Автоматическое обновление SSL

Создайте cron задачу:

```bash
sudo crontab -e
```

Добавьте:

```cron
0 3 * * * certbot renew --quiet --deploy-hook "docker-compose -f /var/www/speedvpn/docker-compose.yml restart nginx"
```

### 3. Настройка домена

Добавьте A-записи в DNS:

```
speedvpn.io     A    YOUR_SERVER_IP
www.speedvpn.io A    YOUR_SERVER_IP
api.speedvpn.io A    YOUR_SERVER_IP
```

Обновите `nginx/nginx.conf`, заменив `server_name _` на `server_name speedvpn.io www.speedvpn.io`.

### 4. Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 🗄️ Работа с базой данных

### Подключение к PostgreSQL

```bash
# Через Docker
docker-compose exec postgres psql -U speedvpn_user -d speedvpn_db

# Или через Adminer
# Откройте http://localhost:8080
# Система: PostgreSQL
# Сервер: postgres
# Пользователь: speedvpn_user
# Пароль: из .env файла
# База данных: speedvpn_db
```

### Применение миграций

Миграции применяются автоматически при первом запуске PostgreSQL.

Для ручного применения:

```bash
docker-compose exec postgres psql -U speedvpn_user -d speedvpn_db -f /docker-entrypoint-initdb.d/V0001__initial_schema.sql
```

### Backup базы данных

```bash
# Создать backup
docker-compose exec postgres pg_dump -U speedvpn_user speedvpn_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Восстановить из backup
gunzip -c backup_20231103.sql.gz | docker-compose exec -T postgres psql -U speedvpn_user speedvpn_db
```

Автоматический backup (cron):

```bash
sudo crontab -e
```

```cron
0 2 * * * cd /var/www/speedvpn && docker-compose exec -T postgres pg_dump -U speedvpn_user speedvpn_db | gzip > /var/backups/speedvpn_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔍 Мониторинг

### Health checks

```bash
# Frontend
curl http://localhost/health

# Backend
curl http://localhost:3000/health

# PostgreSQL
docker-compose exec postgres pg_isready -U speedvpn_user

# Redis
docker-compose exec redis redis-cli -a your_redis_password ping
```

### Просмотр логов

Логи сохраняются в Docker volumes:

```bash
# Nginx логи
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Backend логи
docker-compose logs -f backend

# PostgreSQL логи
docker-compose logs -f postgres
```

### Мониторинг ресурсов

```bash
# CPU, память, сеть
docker stats

# Использование дискового пространства
docker system df

# Детальная информация о контейнерах
docker-compose ps -a
```

---

## 🔄 Обновление приложения

### Обновление кода

```bash
# 1. Получите новый код
git pull origin main

# 2. Пересоберите frontend
bun run build

# 3. Пересоберите и перезапустите backend
docker-compose up -d --build backend

# 4. Перезапустите nginx для подхватывания нового frontend
docker-compose restart nginx

# 5. Примените новые миграции (если есть)
# Подключитесь к БД и выполните новые файлы из db_migrations/
```

### Откат к предыдущей версии

```bash
# 1. Откатите git
git checkout PREVIOUS_COMMIT_HASH

# 2. Пересоберите
bun run build
docker-compose up -d --build backend
docker-compose restart nginx
```

---

## 🐛 Troubleshooting

### Проблема: Backend не запускается

**Ошибка:** `Error: Cannot find module 'express'`

**Решение:**
```bash
# Пересоберите образ
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Проблема: PostgreSQL не подключается

**Ошибка:** `connection refused`

**Решение:**
```bash
# Проверьте статус
docker-compose ps postgres

# Посмотрите логи
docker-compose logs postgres

# Перезапустите
docker-compose restart postgres

# Проверьте переменные окружения
docker-compose exec backend env | grep DATABASE
```

### Проблема: Frontend возвращает 502

**Ошибка:** `502 Bad Gateway`

**Решение:**
```bash
# Проверьте статус backend
docker-compose ps backend

# Проверьте логи nginx
docker-compose logs nginx

# Проверьте логи backend
docker-compose logs backend

# Перезапустите сервисы
docker-compose restart backend nginx
```

### Проблема: Миграции не применились

**Решение:**
```bash
# Подключитесь к БД
docker-compose exec postgres psql -U speedvpn_user -d speedvpn_db

# Проверьте таблицы
\dt

# Вручную примените миграции
\i /docker-entrypoint-initdb.d/V0001__initial_schema.sql
```

### Проблема: Не хватает места на диске

**Решение:**
```bash
# Удалите неиспользуемые образы
docker image prune -a

# Удалите неиспользуемые volumes
docker volume prune

# Удалите все остановленные контейнеры
docker container prune

# Очистите весь Docker
docker system prune -a --volumes
```

### Проблема: Высокая нагрузка на CPU

**Решение:**
```bash
# Проверьте использование ресурсов
docker stats

# Ограничьте ресурсы для сервиса
# Добавьте в docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

# Перезапустите
docker-compose up -d
```

---

## 📊 Scaling (масштабирование)

### Горизонтальное масштабирование backend

```bash
# Запустите несколько инстансов backend
docker-compose up -d --scale backend=3

# Nginx автоматически будет балансировать нагрузку
```

### Добавление load balancer

Обновите `nginx/nginx.conf`:

```nginx
upstream backend_api {
    least_conn;
    server backend:3000 max_fails=3 fail_timeout=30s;
    server backend-2:3000 max_fails=3 fail_timeout=30s;
    server backend-3:3000 max_fails=3 fail_timeout=30s;
}
```

---

## 🧹 Очистка

### Полное удаление (ВНИМАНИЕ: удаляет все данные!)

```bash
# Остановить и удалить контейнеры, volumes, сети
docker-compose down -v

# Удалить образы
docker rmi speedvpn-backend speedvpn-nginx

# Удалить неиспользуемые данные Docker
docker system prune -a --volumes
```

---

## 🔐 Безопасность

### Рекомендации для production:

1. **Смените все дефолтные пароли** в `.env`
2. **Используйте SSL сертификаты** (Let's Encrypt)
3. **Ограничьте доступ к Adminer** (только для разработки)
4. **Настройте firewall** (ufw, iptables)
5. **Регулярно обновляйте образы:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
6. **Мониторьте логи** на подозрительную активность
7. **Делайте backup БД** ежедневно
8. **Используйте secrets** для чувствительных данных:
   ```yaml
   services:
     backend:
       secrets:
         - db_password
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

---

## 📚 Дополнительные ресурсы

- [Docker Compose документация](https://docs.docker.com/compose/)
- [Nginx конфигурация](https://nginx.org/en/docs/)
- [PostgreSQL в Docker](https://hub.docker.com/_/postgres)
- [Let's Encrypt SSL](https://letsencrypt.org/)

---

## 💬 Поддержка

- **Telegram сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy
- **GitHub Issues:** https://github.com/your-repo/issues
- **Документация:** https://speedvpn.io/docs

---

**Готово! Ваш Speed VPN работает в Docker! 🚀**
