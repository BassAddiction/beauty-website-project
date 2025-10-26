# 🚀 Инструкция по развёртыванию Speed VPN на своём сервере

## 📦 Что у тебя есть сейчас

Твой проект состоит из:
- **Frontend** (React + Vite) — интерфейс сайта
- **Backend Functions** (Python) — 5 облачных функций в `/backend/`
- **Database** (PostgreSQL) — база данных на poehali.dev
- **Secrets** — API ключи (YooKassa, SMTP, Remnawave)

## ⚠️ ВАЖНО: Проблемы при переносе

1. **Backend функции** — работают только на poehali.dev (Cloud Functions)
2. **База данных** — доступна только с poehali.dev
3. **Secrets** — хранятся на poehali.dev

**Варианты решения:**
- **Вариант А**: Разместить только frontend на своём сервере, а backend оставить на poehali.dev
- **Вариант Б**: Полностью перенести всё (сложнее, нужен свой сервер для Python и PostgreSQL)

---

## 🎯 ВАРИАНТ А: Frontend на своём сервере + Backend на poehali.dev

### Шаг 1: Подготовка кода

**1.1. Клонируй репозиторий:**
```bash
git clone https://github.com/ТВОЙ_АККАУНТ/ТВОЙ_РЕПОЗИТОРИЙ.git
cd ТВОЙ_РЕПОЗИТОРИЙ
```

**1.2. Установи зависимости:**
```bash
npm install
```

**1.3. Измени домен в коде**

Файл `index.html` (строка 25):
```html
<!-- БЫЛО: -->
<link rel="canonical" href="https://beauty-website-project.poehali.app/">

<!-- СТАЛО: -->
<link rel="canonical" href="https://ТВОй_ДОМЕН.ru/">
```

Файл `backend/payment/index.py` (строка 128):
```python
# БЫЛО:
'return_url': 'https://speedvpn.poehali.dev/payment-success'

# СТАЛО:
'return_url': 'https://ТВОй_ДОМЕН.ru/payment-success'
```

**1.4. Собери проект:**
```bash
npm run build
```

Готовая сборка будет в папке `/dist/`

---

### Шаг 2: Загрузка на сервер

**2.1. Подключись к серверу:**
```bash
ssh user@ТВОй_СЕРВЕР.ru
```

**2.2. Создай папку для сайта:**
```bash
mkdir -p /var/www/speedvpn
```

**2.3. Загрузи файлы из папки `dist/`:**
```bash
# На своём компьютере:
scp -r dist/* user@ТВОй_СЕРВЕР.ru:/var/www/speedvpn/
```

---

### Шаг 3: Настройка веб-сервера (Nginx)

**3.1. Создай конфиг Nginx:**
```bash
sudo nano /etc/nginx/sites-available/speedvpn
```

**3.2. Вставь конфигурацию:**
```nginx
server {
    listen 80;
    server_name ТВОй_ДОМЕН.ru www.ТВОй_ДОМЕН.ru;
    
    root /var/www/speedvpn;
    index index.html;
    
    # Поддержка React Router (все запросы → index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кеширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**3.3. Активируй конфиг:**
```bash
sudo ln -s /etc/nginx/sites-available/speedvpn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Шаг 4: SSL сертификат (HTTPS)

**4.1. Установи Certbot:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

**4.2. Получи SSL сертификат:**
```bash
sudo certbot --nginx -d ТВОй_ДОМЕН.ru -d www.ТВОй_ДОМЕН.ru
```

**4.3. Автопродление:**
```bash
sudo certbot renew --dry-run
```

---

### Шаг 5: Настройка YooKassa webhook

**5.1. Зайди в личный кабинет YooKassa:**
https://yookassa.ru/my/merchant/integration/http-notifications

**5.2. Укажи URL вебхука:**
```
https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158
```
(Это твоя функция `remnawave` — она уже работает!)

**5.3. Выбери события:**
- ✅ payment.succeeded (успешный платёж)
- ✅ payment.canceled (отмена платежа)

---

## ✅ Готово!

Теперь:
- **Frontend** работает на `https://ТВОй_ДОМЕН.ru`
- **Backend функции** остались на poehali.dev
- **YooKassa** отправляет уведомления на poehali.dev webhook
- **База данных** на poehali.dev

---

## 🔧 ВАРИАНТ Б: Полный перенос (все компоненты на свой сервер)

Если нужно перенести ВСЁ (включая backend и базу), потребуется:

### 1. Настроить PostgreSQL на своём сервере
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb speedvpn
```

### 2. Перенести данные базы

Экспортировать данные из poehali.dev (нужен доступ к БД) и импортировать в свою:
```bash
psql -U postgres speedvpn < database_dump.sql
```

### 3. Переписать backend функции на обычный Python API

Вместо Cloud Functions создать Flask/FastAPI сервер:

**Установка:**
```bash
pip install flask psycopg2-binary requests
```

**Пример `app.py`:**
```python
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/api/payment', methods=['POST', 'OPTIONS'])
def payment():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    # Здесь код из backend/payment/index.py
    # ...
    
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Запуск через systemd:**
```bash
sudo nano /etc/systemd/system/speedvpn-api.service
```

```ini
[Unit]
Description=Speed VPN API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/speedvpn-api
Environment="DATABASE_URL=postgresql://user:pass@localhost/speedvpn"
Environment="YOOKASSA_SHOP_ID=твой_id"
Environment="YOOKASSA_SECRET_KEY=твой_ключ"
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable speedvpn-api
sudo systemctl start speedvpn-api
```

**Настройка Nginx для API:**
```nginx
# Добавить в конфиг сервера:
location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 4. Изменить все URL в коде

Заменить все `https://functions.poehali.dev/...` на `https://ТВОй_ДОМЕН.ru/api/...`

**Файлы для изменения:**
- `src/components/PricingSection.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Register.tsx`
- `src/pages/GetAccess.tsx`
- `src/pages/AdminUpdate.tsx`
- `src/pages/TestWebhook.tsx`

**Найти и заменить:**
```bash
# В корне проекта:
find src -type f -name "*.tsx" -exec sed -i 's|https://functions.poehali.dev/[a-z0-9-]*|https://ТВОй_ДОМЕН.ru/api|g' {} +
```

---

## 📊 Сравнение вариантов

| Параметр | Вариант А | Вариант Б |
|----------|-----------|-----------|
| Сложность | ⭐ Простая | ⭐⭐⭐⭐⭐ Очень сложная |
| Время | 1-2 часа | 1-2 дня |
| Стоимость | Бесплатно (poehali.dev backend) | Нужен VPS ($5-20/мес) |
| Контроль | Частичный | Полный |
| Поддержка | Backend на poehali.dev | Сам настраиваешь всё |

---

## 🎯 Рекомендация

**Начни с Варианта А** — он быстрый и простой. Backend функции и база данных останутся на poehali.dev, а сайт будет работать на твоём домене.

Если позже понадобится полный контроль — можно перейти на Вариант Б.

---

## 🆘 Частые проблемы

### Проблема 1: CORS ошибки
**Решение:** Backend функции на poehali.dev уже настроены на `Access-Control-Allow-Origin: *`

### Проблема 2: YooKassa не присылает уведомления
**Решение:** Проверь, что URL вебхука точно `https://functions.poehali.dev/d8d680b3-23f3-481e-b8cf-ccb969e2f158`

### Проблема 3: 404 при переходе на /dashboard
**Решение:** Убедись что в Nginx есть `try_files $uri $uri/ /index.html;`

### Проблема 4: Платежи не работают
**Решение:** Измени `return_url` в `backend/payment/index.py` на свой домен и обнови функцию на poehali.dev

---

## 📞 Нужна помощь?

Если что-то не получается:
1. Проверь логи Nginx: `sudo tail -f /var/log/nginx/error.log`
2. Проверь статус сервиса: `sudo systemctl status nginx`
3. Напиши мне — помогу разобраться!
