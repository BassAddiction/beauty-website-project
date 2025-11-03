.PHONY: help build start stop restart logs clean backup restore

# Переменные
DOCKER_COMPOSE = docker-compose
PROJECT_NAME = speedvpn
BACKUP_DIR = ./backups

help: ## Показать справку
	@echo "Speed VPN - Docker Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости и собрать frontend
	@echo "📦 Установка зависимостей..."
	bun install
	@echo "🔨 Сборка frontend..."
	bun run build
	@echo "✅ Готово!"

build: ## Собрать все Docker образы
	@echo "🔨 Сборка Docker образов..."
	$(DOCKER_COMPOSE) build
	@echo "✅ Образы собраны!"

start: ## Запустить все сервисы
	@echo "🚀 Запуск сервисов..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Сервисы запущены!"
	@echo ""
	@echo "Frontend:  http://localhost"
	@echo "Backend:   http://localhost:3000"
	@echo "Adminer:   http://localhost:8080 (профиль: debug)"

stop: ## Остановить все сервисы
	@echo "⏸️  Остановка сервисов..."
	$(DOCKER_COMPOSE) stop
	@echo "✅ Сервисы остановлены!"

down: ## Остановить и удалить контейнеры
	@echo "🗑️  Удаление контейнеров..."
	$(DOCKER_COMPOSE) down
	@echo "✅ Контейнеры удалены!"

restart: ## Перезапустить все сервисы
	@echo "🔄 Перезапуск сервисов..."
	$(DOCKER_COMPOSE) restart
	@echo "✅ Сервисы перезапущены!"

logs: ## Показать логи всех сервисов
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## Показать логи backend
	$(DOCKER_COMPOSE) logs -f backend

logs-nginx: ## Показать логи nginx
	$(DOCKER_COMPOSE) logs -f nginx

logs-db: ## Показать логи PostgreSQL
	$(DOCKER_COMPOSE) logs -f postgres

status: ## Показать статус сервисов
	@echo "📊 Статус сервисов:"
	@$(DOCKER_COMPOSE) ps

stats: ## Показать использование ресурсов
	@echo "📈 Использование ресурсов:"
	@docker stats --no-stream

health: ## Проверить здоровье сервисов
	@echo "🏥 Проверка здоровья сервисов:"
	@echo ""
	@echo "Frontend:"
	@curl -s http://localhost/health || echo "❌ Недоступен"
	@echo ""
	@echo "Backend:"
	@curl -s http://localhost:3000/health | grep -q "healthy" && echo "✅ Здоров" || echo "❌ Недоступен"
	@echo ""
	@echo "PostgreSQL:"
	@$(DOCKER_COMPOSE) exec postgres pg_isready -U speedvpn_user && echo "✅ Здоров" || echo "❌ Недоступен"

shell-backend: ## Открыть shell в backend контейнере
	$(DOCKER_COMPOSE) exec backend sh

shell-db: ## Открыть psql в PostgreSQL
	$(DOCKER_COMPOSE) exec postgres psql -U speedvpn_user -d speedvpn_db

backup: ## Создать backup базы данных
	@echo "💾 Создание backup..."
	@mkdir -p $(BACKUP_DIR)
	@$(DOCKER_COMPOSE) exec -T postgres pg_dump -U speedvpn_user speedvpn_db | gzip > $(BACKUP_DIR)/backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup создан: $(BACKUP_DIR)/backup_$(shell date +%Y%m%d_%H%M%S).sql.gz"

restore: ## Восстановить из последнего backup
	@echo "⚠️  Восстановление базы данных из backup..."
	@gunzip -c $(shell ls -t $(BACKUP_DIR)/backup_*.sql.gz | head -1) | $(DOCKER_COMPOSE) exec -T postgres psql -U speedvpn_user speedvpn_db
	@echo "✅ База данных восстановлена!"

clean: ## Удалить неиспользуемые Docker ресурсы
	@echo "🧹 Очистка Docker..."
	docker system prune -f
	@echo "✅ Очистка завершена!"

clean-all: ## Удалить ВСЕ Docker ресурсы (ВНИМАНИЕ: удаляет volumes!)
	@echo "⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные!"
	@read -p "Продолжить? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(DOCKER_COMPOSE) down -v
	@docker system prune -a -f --volumes
	@echo "✅ Полная очистка завершена!"

update: ## Обновить приложение
	@echo "🔄 Обновление приложения..."
	@git pull origin main
	@bun install
	@bun run build
	@$(DOCKER_COMPOSE) up -d --build backend
	@$(DOCKER_COMPOSE) restart nginx
	@echo "✅ Приложение обновлено!"

deploy: install build start ## Полный деплой (установка + сборка + запуск)
	@echo "🎉 Деплой завершен!"
	@echo ""
	@echo "Frontend:  http://localhost"
	@echo "Backend:   http://localhost:3000"

prod: ## Запустить в production режиме
	@echo "🚀 Запуск в production режиме..."
	@$(DOCKER_COMPOSE) -f docker-compose.yml up -d
	@echo "✅ Production запущен!"

dev: ## Запустить в development режиме (с Adminer)
	@echo "🔧 Запуск в development режиме..."
	@$(DOCKER_COMPOSE) --profile debug up -d
	@echo "✅ Development запущен!"
	@echo ""
	@echo "Frontend:  http://localhost"
	@echo "Backend:   http://localhost:3000"
	@echo "Adminer:   http://localhost:8080"
