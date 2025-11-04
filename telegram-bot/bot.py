import os
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List
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

class Database:
    def __init__(self):
        self.conn_string = os.getenv('DATABASE_URL')
        
    def get_connection(self):
        return psycopg2.connect(self.conn_string)
    
    def get_active_plans(self) -> List[Dict]:
        '''Получить активные тарифы из базы данных'''
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT plan_id, name, price, days, traffic_gb, features, show_on
                    FROM t_p66544974_beauty_website_proje.subscription_plans
                    WHERE is_active = true AND is_custom = false
                    ORDER BY sort_order, plan_id
                """)
                return cur.fetchall()
    
    def get_plan_by_id(self, plan_id: int) -> Optional[Dict]:
        '''Получить тариф по ID'''
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT plan_id, name, price, days, traffic_gb, features, squad_uuids
                    FROM t_p66544974_beauty_website_proje.subscription_plans
                    WHERE plan_id = %s AND is_active = true
                """, (plan_id,))
                return cur.fetchone()
    
    def get_user(self, telegram_id: int) -> Optional[Dict]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    'SELECT * FROM t_p66544974_beauty_website_proje.telegram_users WHERE telegram_id = %s',
                    (telegram_id,)
                )
                return cur.fetchone()
    
    def create_user(self, telegram_id: int, username: str = None, full_name: str = None):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''INSERT INTO t_p66544974_beauty_website_proje.telegram_users 
                       (telegram_id, username, full_name, created_at)
                       VALUES (%s, %s, %s, %s)
                       ON CONFLICT (telegram_id) DO UPDATE
                       SET username = EXCLUDED.username, full_name = EXCLUDED.full_name''',
                    (telegram_id, username, full_name, datetime.utcnow())
                )
                conn.commit()
    
    def create_payment(self, telegram_id: int, plan_id: int, payment_id: str, amount: float):
        '''Создать запись о платеже'''
        user = self.get_user(telegram_id)
        if not user:
            return None
        
        plan = self.get_plan_by_id(plan_id)
        if not plan:
            return None
        
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''INSERT INTO t_p66544974_beauty_website_proje.telegram_payments
                       (telegram_user_id, plan_id, payment_id, amount, status, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       RETURNING id''',
                    (user['id'], plan_id, payment_id, amount, 'pending', datetime.utcnow())
                )
                payment_row_id = cur.fetchone()[0]
                conn.commit()
                return payment_row_id
    
    def update_payment_status(self, payment_id: str, status: str):
        '''Обновить статус платежа'''
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    '''UPDATE t_p66544974_beauty_website_proje.telegram_payments
                       SET status = %s, updated_at = %s
                       WHERE payment_id = %s''',
                    (status, datetime.utcnow(), payment_id)
                )
                conn.commit()
    
    def get_user_subscriptions(self, telegram_id: int) -> List[Dict]:
        '''Получить подписки пользователя'''
        user = self.get_user(telegram_id)
        if not user:
            return []
        
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        tp.payment_id,
                        tp.amount,
                        tp.status,
                        tp.created_at,
                        sp.name as plan_name,
                        sp.days as plan_days,
                        sp.price as plan_price
                    FROM t_p66544974_beauty_website_proje.telegram_payments tp
                    JOIN t_p66544974_beauty_website_proje.subscription_plans sp 
                        ON tp.plan_id = sp.plan_id
                    WHERE tp.telegram_user_id = %s
                    ORDER BY tp.created_at DESC
                """, (user['id'],))
                return cur.fetchall()

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
        [InlineKeyboardButton("📊 Мои подписки", callback_data='my_subscriptions')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

Добро пожаловать в **Speed VPN** 🚀

Быстрый, надежный и безопасный VPN для доступа к YouTube, соцсетям и ChatGPT.

✓ Высокая скорость подключения
✓ Стабильная работа 24/7
✓ Несколько устройств одновременно
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
    
    plans = db.get_active_plans()
    
    if not plans:
        await query.edit_message_text(
            "⚠️ Извините, тарифы временно недоступны.\nПопробуйте позже или свяжитесь с поддержкой."
        )
        return
    
    keyboard = []
    for plan in plans:
        traffic_text = f"{plan['traffic_gb']} ГБ/день" if plan['traffic_gb'] else "Безлимит"
        button_text = f"💳 {plan['name']} - {int(plan['price'])} ₽"
        keyboard.append([InlineKeyboardButton(button_text, callback_data=f"plan_{plan['plan_id']}")])
    
    keyboard.append([InlineKeyboardButton("« Назад", callback_data='back_to_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = """
🛒 **Выберите тариф:**

Все тарифы включают:
✓ Доступ к YouTube, соцсетям, ChatGPT
✓ Высокая скорость
✓ Несколько устройств
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
    
    plan_id = int(query.data.replace('plan_', ''))
    plan = db.get_plan_by_id(plan_id)
    
    if not plan:
        await query.edit_message_text("⚠️ Тариф не найден")
        return
    
    features_text = ""
    if plan.get('features'):
        features_list = plan['features'] if isinstance(plan['features'], list) else []
        features_text = "\n".join([f"✓ {f}" for f in features_list])
    else:
        traffic_text = f"{plan['traffic_gb']} ГБ/день" if plan['traffic_gb'] else "Безлимитный трафик"
        features_text = f"""✓ {traffic_text}
✓ {plan['days']} дней доступа
✓ Высокая скорость
✓ Несколько устройств"""
    
    keyboard = [
        [InlineKeyboardButton(
            f"💳 Оплатить {int(plan['price'])} ₽",
            callback_data=f"pay_{plan_id}"
        )],
        [InlineKeyboardButton("« Назад к тарифам", callback_data='buy')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = f"""
**{plan['name']}**

{features_text}

💰 Стоимость: **{int(plan['price'])} ₽**
⏱ Срок: **{plan['days']} дней**
"""
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def process_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    plan_id = int(query.data.replace('pay_', ''))
    plan = db.get_plan_by_id(plan_id)
    
    if not plan:
        await query.edit_message_text("⚠️ Тариф не найден")
        return
    
    provider_token = os.getenv('PAYMENT_PROVIDER_TOKEN')
    
    if not provider_token:
        await query.edit_message_text(
            "⚠️ Платежная система временно недоступна.\n"
            "Пожалуйста, попробуйте позже или свяжитесь с поддержкой:\n"
            "@speedvpn_support"
        )
        return
    
    title = f"Speed VPN - {plan['name']}"
    description = f"{plan['days']} дней доступа к VPN"
    payload = json.dumps({
        'plan_id': plan_id,
        'telegram_id': update.effective_user.id
    })
    currency = "RUB"
    
    prices = [LabeledPrice(plan['name'], int(plan['price'] * 100))]
    
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
    
    try:
        payload_data = json.loads(query.invoice_payload)
        plan_id = payload_data.get('plan_id')
        
        plan = db.get_plan_by_id(plan_id)
        if not plan:
            await query.answer(ok=False, error_message="Тариф не найден")
            return
        
        await query.answer(ok=True)
    except Exception as e:
        logger.error(f"Precheckout error: {e}")
        await query.answer(ok=False, error_message="Ошибка обработки платежа")

async def successful_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    
    try:
        payload_data = json.loads(payment.invoice_payload)
        plan_id = payload_data.get('plan_id')
        telegram_id = payload_data.get('telegram_id')
        
        plan = db.get_plan_by_id(plan_id)
        if not plan:
            await update.message.reply_text("⚠️ Ошибка: тариф не найден")
            return
        
        db.create_payment(
            telegram_id=telegram_id,
            plan_id=plan_id,
            payment_id=payment.telegram_payment_charge_id,
            amount=payment.total_amount / 100
        )
        
        db.update_payment_status(payment.telegram_payment_charge_id, 'succeeded')
        
        success_text = f"""
✅ **Оплата успешно завершена!**

Подписка: {plan['name']}
Срок действия: {plan['days']} дней
Сумма: {int(plan['price'])} ₽

📱 **Как подключиться к VPN:**

Мы отправили вам письмо с инструкциями на email, который вы указали при регистрации.

В письме вы найдете:
• Ссылку для скачивания приложения
• Пошаговую инструкцию по подключению
• Ваши данные для входа

⚠️ **Не получили письмо?**
1. Проверьте папку "Спам"
2. Напишите в поддержку: @speedvpn_support
3. Укажите ID платежа: `{payment.telegram_payment_charge_id}`

Если нужна помощь, нажмите /help

Приятного использования! 🚀
"""
        
        await update.message.reply_text(
            success_text,
            parse_mode='Markdown'
        )
        
    except Exception as e:
        logger.error(f"Payment processing error: {e}")
        await update.message.reply_text(
            "⚠️ Оплата прошла, но возникла ошибка обработки.\n"
            f"Обратитесь в поддержку @speedvpn_support с ID платежа:\n"
            f"`{payment.telegram_payment_charge_id}`",
            parse_mode='Markdown'
        )

async def my_subscriptions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    subscriptions = db.get_user_subscriptions(update.effective_user.id)
    
    if not subscriptions:
        keyboard = [
            [InlineKeyboardButton("🛒 Купить подписку", callback_data='buy')],
            [InlineKeyboardButton("« Назад", callback_data='back_to_menu')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        text = "У вас пока нет подписок.\nОформите подписку, чтобы начать пользоваться VPN!"
        
        await query.edit_message_text(text, reply_markup=reply_markup)
        return
    
    text = "📊 **Ваши подписки:**\n\n"
    
    for i, sub in enumerate(subscriptions, 1):
        status_emoji = "✅" if sub['status'] == 'succeeded' else "⏳" if sub['status'] == 'pending' else "❌"
        text += f"{i}. {status_emoji} **{sub['plan_name']}**\n"
        text += f"   Сумма: {int(sub['amount'])} ₽\n"
        text += f"   Дата: {sub['created_at'].strftime('%d.%m.%Y %H:%M')}\n"
        text += f"   Статус: {sub['status']}\n\n"
    
    keyboard = [
        [InlineKeyboardButton("🛒 Купить еще", callback_data='buy')],
        [InlineKeyboardButton("« Назад", callback_data='back_to_menu')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    
    text = """
❓ **Помощь Speed VPN**

**Как начать пользоваться:**

1️⃣ Выберите и оплатите подписку
2️⃣ Получите письмо с инструкциями
3️⃣ Скачайте приложение по ссылке
4️⃣ Войдите с вашими данными
5️⃣ Подключитесь к VPN

**Команды бота:**
/start - Главное меню
/help - Помощь

**Поддержка:**
💬 Telegram: @speedvpn_support

**Часто задаваемые вопросы:**

**Q: Сколько устройств можно подключить?**
A: Зависит от тарифа, обычно до 5 устройств

**Q: Есть ли ограничения по трафику?**
A: Зависит от выбранного тарифа

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
        [InlineKeyboardButton("📊 Мои подписки", callback_data='my_subscriptions')],
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

def main():
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
        return
    
    application = Application.builder().token(token).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    application.add_handler(CallbackQueryHandler(buy_menu, pattern='^buy$'))
    application.add_handler(CallbackQueryHandler(plan_details, pattern='^plan_\d+$'))
    application.add_handler(CallbackQueryHandler(process_payment, pattern='^pay_\d+$'))
    application.add_handler(CallbackQueryHandler(my_subscriptions, pattern='^my_subscriptions$'))
    application.add_handler(CallbackQueryHandler(help_command, pattern='^help$'))
    application.add_handler(CallbackQueryHandler(back_to_menu, pattern='^back_to_menu$'))
    
    application.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_callback))
    
    logger.info("Bot started successfully!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
