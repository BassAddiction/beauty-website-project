import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

PLANS = {
    'monthly': {
        'name': 'Месячный',
        'price': 299,
        'duration_days': 30,
        'description': '🗓 1 месяц безлимитного VPN\n✓ Безлимитный трафик\n✓ Высокая скорость\n✓ 5 устройств'
    },
    'quarterly': {
        'name': 'Квартальный',
        'price': 699,
        'duration_days': 90,
        'description': '📅 3 месяца безлимитного VPN\n✓ Безлимитный трафик\n✓ Высокая скорость\n✓ 5 устройств\n💰 Скидка 22%'
    },
    'yearly': {
        'name': 'Годовой',
        'price': 1999,
        'duration_days': 365,
        'description': '🎉 12 месяцев безлимитного VPN\n✓ Безлимитный трафик\n✓ Высокая скорость\n✓ 5 устройств\n💰 Скидка 44%'
    }
}

class Database:
    def __init__(self):
        self.conn_string = os.getenv('DATABASE_URL')
        
    def get_connection(self):
        return psycopg2.connect(self.conn_string)
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    'SELECT * FROM users WHERE telegram_id = %s',
                    (telegram_id,)
                )
                return cur.fetchone()
    
    def create_user(self, telegram_id: int, username: str = None, full_name: str = None):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''INSERT INTO users (telegram_id, username, full_name, created_at)
                       VALUES (%s, %s, %s, %s)
                       ON CONFLICT (telegram_id) DO NOTHING''',
                    (telegram_id, username, full_name, datetime.utcnow())
                )
                conn.commit()
    
    def create_subscription(self, telegram_id: int, plan: str, payment_id: str):
        user = self.get_user(telegram_id)
        if not user:
            return
        
        duration_days = PLANS[plan]['duration_days']
        expires_at = datetime.utcnow() + timedelta(days=duration_days)
        
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''INSERT INTO subscriptions 
                       (user_id, plan, status, payment_id, created_at, expires_at)
                       VALUES (%s, %s, %s, %s, %s, %s)''',
                    (user['id'], plan, 'active', payment_id, datetime.utcnow(), expires_at)
                )
                conn.commit()
    
    def get_active_subscription(self, telegram_id: int) -> Optional[Dict]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    '''SELECT s.* FROM subscriptions s
                       JOIN users u ON s.user_id = u.id
                       WHERE u.telegram_id = %s
                       AND s.status = 'active'
                       AND s.expires_at > %s
                       ORDER BY s.expires_at DESC
                       LIMIT 1''',
                    (telegram_id, datetime.utcnow())
                )
                return cur.fetchone()

db = Database()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    
    db.create_user(
        telegram_id=user.id,
        username=user.username,
        full_name=user.full_name
    )
    
    keyboard = [
        [InlineKeyboardButton("🛒 Купить подписку", callback_data='buy')],
        [InlineKeyboardButton("📊 Моя подписка", callback_data='my_subscription')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

Добро пожаловать в **Speed VPN** 🚀

Быстрый, надежный и безопасный VPN для всех ваших устройств.

✓ Безлимитный трафик
✓ Высокая скорость
✓ 5 устройств одновременно
✓ Круглосуточная поддержка

Выберите действие:
"""
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def buy_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton(
            f"💳 {PLANS['monthly']['name']} - {PLANS['monthly']['price']} ₽/мес",
            callback_data='plan_monthly'
        )],
        [InlineKeyboardButton(
            f"💎 {PLANS['quarterly']['name']} - {PLANS['quarterly']['price']} ₽ (22% скидка)",
            callback_data='plan_quarterly'
        )],
        [InlineKeyboardButton(
            f"🎁 {PLANS['yearly']['name']} - {PLANS['yearly']['price']} ₽ (44% скидка)",
            callback_data='plan_yearly'
        )],
        [InlineKeyboardButton("« Назад", callback_data='back_to_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = """
🛒 **Выберите тариф:**

Все тарифы включают:
✓ Безлимитный трафик
✓ Высокая скорость
✓ До 5 устройств
✓ Доступ ко всем серверам
✓ Круглосуточная поддержка
"""
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def plan_details(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    plan_type = query.data.replace('plan_', '')
    plan = PLANS[plan_type]
    
    keyboard = [
        [InlineKeyboardButton(
            f"💳 Оплатить {plan['price']} ₽",
            callback_data=f'pay_{plan_type}'
        )],
        [InlineKeyboardButton("« Назад к тарифам", callback_data='buy')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = f"""
**{plan['name']} тариф**

{plan['description']}

💰 Стоимость: **{plan['price']} ₽**
"""
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def process_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    plan_type = query.data.replace('pay_', '')
    plan = PLANS[plan_type]
    
    provider_token = os.getenv('PAYMENT_PROVIDER_TOKEN')
    
    if not provider_token:
        await query.edit_message_text(
            "⚠️ Платежная система временно недоступна.\n"
            "Пожалуйста, попробуйте позже или свяжитесь с поддержкой."
        )
        return
    
    title = f"Speed VPN - {plan['name']}"
    description = plan['description']
    payload = f"{plan_type}_{update.effective_user.id}"
    currency = "RUB"
    
    prices = [LabeledPrice(plan['name'], plan['price'] * 100)]
    
    await context.bot.send_invoice(
        chat_id=update.effective_user.id,
        title=title,
        description=description,
        payload=payload,
        provider_token=provider_token,
        currency=currency,
        prices=prices,
        start_parameter='speed-vpn-subscription'
    )

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.pre_checkout_query
    await query.answer(ok=True)

async def successful_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    payload = payment.invoice_payload
    plan_type = payload.split('_')[0]
    
    db.create_subscription(
        telegram_id=update.effective_user.user.id,
        plan=plan_type,
        payment_id=payment.telegram_payment_charge_id
    )
    
    plan = PLANS[plan_type]
    
    success_text = f"""
✅ **Оплата успешно завершена!**

Подписка: {plan['name']}
Срок действия: {plan['duration_days']} дней

📱 **Как подключиться:**

1. Скачайте WireGuard:
   • iOS: [App Store](https://apps.apple.com/app/wireguard/id1441195209)
   • Android: [Google Play](https://play.google.com/store/apps/details?id=com.wireguard.android)
   
2. Получите конфигурацию:
   Нажмите /config чтобы получить ваш файл конфигурации

3. Импортируйте конфигурацию в WireGuard

Если нужна помощь, нажмите /help

Приятного использования! 🚀
"""
    
    await update.message.reply_text(
        success_text,
        parse_mode='Markdown'
    )

async def my_subscription(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    subscription = db.get_active_subscription(update.effective_user.id)
    
    if not subscription:
        keyboard = [
            [InlineKeyboardButton("🛒 Купить подписку", callback_data='buy')],
            [InlineKeyboardButton("« Назад", callback_data='back_to_menu')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        text = "У вас нет активной подписки.\nОформите подписку, чтобы начать пользоваться VPN!"
        
        await query.edit_message_text(text, reply_markup=reply_markup)
        return
    
    plan = PLANS[subscription['plan']]
    expires_at = subscription['expires_at']
    days_left = (expires_at - datetime.utcnow()).days
    
    keyboard = [
        [InlineKeyboardButton("📥 Получить конфигурацию", callback_data='get_config')],
        [InlineKeyboardButton("🔄 Продлить подписку", callback_data='buy')],
        [InlineKeyboardButton("« Назад", callback_data='back_to_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = f"""
📊 **Ваша подписка:**

Тариф: {plan['name']}
Статус: {'✅ Активна' if days_left > 0 else '⚠️ Истекла'}
Истекает: {expires_at.strftime('%d.%m.%Y')}
Осталось дней: {days_left}

Для получения конфигурации WireGuard нажмите кнопку ниже.
"""
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def get_config(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    subscription = db.get_active_subscription(update.effective_user.id)
    
    if not subscription:
        await query.edit_message_text(
            "⚠️ У вас нет активной подписки.\nСначала оформите подписку!"
        )
        return
    
    config_text = f"""[Interface]
PrivateKey = <YOUR_PRIVATE_KEY>
Address = 10.0.0.{update.effective_user.id % 254}/32
DNS = 1.1.1.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
"""
    
    config_filename = f"speed-vpn-{update.effective_user.id}.conf"
    
    with open(config_filename, 'w') as f:
        f.write(config_text)
    
    await context.bot.send_document(
        chat_id=update.effective_user.id,
        document=open(config_filename, 'rb'),
        filename=config_filename,
        caption="📥 Ваш файл конфигурации WireGuard\n\nИмпортируйте его в приложение WireGuard"
    )
    
    os.remove(config_filename)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    
    text = """
❓ **Помощь Speed VPN**

**Как начать пользоваться:**

1️⃣ Выберите и оплатите подписку
2️⃣ Скачайте приложение WireGuard
3️⃣ Получите конфигурацию через /config
4️⃣ Импортируйте конфигурацию в WireGuard
5️⃣ Активируйте VPN

**Команды бота:**
/start - Главное меню
/config - Получить конфигурацию
/help - Помощь

**Поддержка:**
📧 Email: support@speedvpn.io
💬 Telegram: @speedvpn_support

**Часто задаваемые вопросы:**

**Q: Сколько устройств можно подключить?**
A: До 5 устройств одновременно

**Q: Есть ли ограничения по трафику?**
A: Нет, трафик безлимитный

**Q: Как быстро активируется подписка?**
A: Мгновенно после оплаты

**Q: Можно ли вернуть деньги?**
A: Да, в течение 7 дней с момента покупки
"""
    
    keyboard = [[InlineKeyboardButton("« Назад в меню", callback_data='back_to_menu')]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if query:
        await query.answer()
        await query.edit_message_text(text, reply_markup=reply_markup, parse_mode='Markdown')
    else:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode='Markdown')

async def back_to_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    keyboard = [
        [InlineKeyboardButton("🛒 Купить подписку", callback_data='buy')],
        [InlineKeyboardButton("📊 Моя подписка", callback_data='my_subscription')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = """
**Speed VPN** 🚀

Выберите действие:
"""
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def config_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await get_config(update, context)

def main():
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
        return
    
    application = Application.builder().token(token).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("config", config_command))
    
    application.add_handler(CallbackQueryHandler(buy_menu, pattern='^buy$'))
    application.add_handler(CallbackQueryHandler(plan_details, pattern='^plan_'))
    application.add_handler(CallbackQueryHandler(process_payment, pattern='^pay_'))
    application.add_handler(CallbackQueryHandler(my_subscription, pattern='^my_subscription$'))
    application.add_handler(CallbackQueryHandler(get_config, pattern='^get_config$'))
    application.add_handler(CallbackQueryHandler(help_command, pattern='^help$'))
    application.add_handler(CallbackQueryHandler(back_to_menu, pattern='^back_to_menu$'))
    
    application.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_callback))
    
    logger.info("Bot started successfully!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
