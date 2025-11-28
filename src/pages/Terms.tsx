import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { pageSEO } from "@/utils/seo";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CDN_ASSETS } from '@/config/api';

const Terms = () => {
  useSEO(pageSEO.terms);
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={CDN_ASSETS.CLIENT_ICONS.WINDOWS} alt="Speed VPN" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">SPEED VPN</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="icon">
              <Icon name="X" size={20} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Публичная оферта</h1>
        <p className="text-muted-foreground mb-8">Дата последнего обновления: 28 октября 2025 г.</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Общие положения</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              1.1. Настоящая публичная оферта (далее — «Оферта») является официальным предложением Speed VPN (далее — «Исполнитель») 
              заключить договор на оказание услуг VPN-подключения на изложенных ниже условиях.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              1.2. Акцепт (принятие) Оферты осуществляется путем оплаты услуг через сайт speedvpn.io 
              и означает полное и безоговорочное принятие всех условий настоящей Оферты.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              1.3. Настоящая Оферта вступает в силу с момента её размещения на сайте и действует до момента отзыва Исполнителем.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Предмет договора</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              2.1. Исполнитель обязуется предоставить Заказчику доступ к VPN-серверам для обеспечения защищенного 
              и анонимного интернет-соединения на условиях выбранного тарифного плана.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              2.2. Услуги предоставляются на основании выбранного Заказчиком тарифного плана:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>1 Месяц — 200 ₽/месяц</li>
              <li>3 Месяца — 500 ₽ (167 ₽/месяц)</li>
              <li>6 Месяцев — 900 ₽ (150 ₽/месяц)</li>
              <li>12 Месяцев — 1200 ₽ (100 ₽/месяц)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              2.3. Срок действия услуги начинается с момента активации доступа после успешной оплаты.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Права и обязанности сторон</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1. Исполнитель обязуется:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Предоставить Заказчику доступ к VPN-серверам в течение 24 часов после оплаты</li>
              <li>Обеспечить стабильную работу VPN-серверов с гарантией uptime не менее 99%</li>
              <li>Предоставить техническую поддержку через Telegram</li>
              <li>Не передавать третьим лицам информацию о действиях Заказчика</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2. Заказчик обязуется:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Своевременно оплачивать услуги в соответствии с выбранным тарифным планом</li>
              <li>Не использовать услуги для незаконной деятельности</li>
              <li>Не передавать данные доступа третьим лицам</li>
              <li>Соблюдать законодательство Российской Федерации при использовании услуг</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3. Исполнитель имеет право:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Приостановить или прекратить предоставление услуг при нарушении Заказчиком условий Оферты</li>
              <li>Изменять тарифные планы с предварительным уведомлением Заказчиков за 14 дней</li>
              <li>Проводить технические работы с предварительным уведомлением</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Порядок оплаты</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              4.1. Оплата услуг производится через платежную систему на сайте onproduct.pro или speedvpn.io.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              4.2. Услуга считается оплаченной с момента зачисления денежных средств на расчетный счет Исполнителя.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              4.3. При выборе подписки на срок более месяца оплата производится единовременно за весь период.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              4.4. НДС не облагается (УСН).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Возврат денежных средств</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              5.1. Возврат денежных средств возможен в течение 7 дней с момента оплаты, если услуга не была активирована.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              5.2. После активации доступа возврат денежных средств не производится.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              5.3. Для оформления возврата необходимо обратиться в службу поддержки через Telegram: 
              <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                @gospeedvpn
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Ответственность сторон</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              6.1. Исполнитель не несет ответственности за:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Действия Заказчика, нарушающие законодательство РФ</li>
              <li>Технические сбои, вызванные действиями третьих лиц или форс-мажорными обстоятельствами</li>
              <li>Качество и скорость интернет-соединения Заказчика</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              6.2. Заказчик несет полную ответственность за использование услуг в соответствии с законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Конфиденциальность</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              7.1. Исполнитель обязуется не собирать, не хранить и не передавать третьим лицам данные о 
              сетевой активности Заказчика (No-logs policy).
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              7.2. Сохраняются только данные, необходимые для работы системы оплаты и предоставления доступа 
              (email, данные платежа).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              7.3. Исполнитель имеет право раскрыть информацию о Заказчике только по официальному запросу 
              правоохранительных органов в соответствии с законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Срок действия и расторжение договора</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              8.1. Договор вступает в силу с момента акцепта Оферты и действует до истечения оплаченного периода.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              8.2. Договор автоматически расторгается по истечении оплаченного периода, если Заказчик не продлил подписку.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              8.3. Заказчик имеет право расторгнуть договор досрочно без возврата оплаченных средств.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Изменение условий оферты</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              9.1. Исполнитель оставляет за собой право вносить изменения в условия Оферты в одностороннем порядке.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              9.2. Новая редакция Оферты вступает в силу с момента её размещения на сайте, если иное не предусмотрено 
              новой редакцией Оферты.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              9.3. Заказчик обязуется самостоятельно отслеживать изменения в Оферте. Продолжение использования 
              услуг после изменения Оферты означает согласие с новыми условиями.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Реквизиты исполнителя</h2>
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Название:</strong> Speed VPN
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Сайт:</strong> onproduct.pro, speedvpn.io
              </p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Email:</strong> support@onproduct.pro
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Telegram:</strong> <a href="https://t.me/gospeedvpn" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@gospeedvpn</a>
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Оформляя заказ на сайте, вы подтверждаете, что ознакомились с условиями настоящей Оферты 
              и полностью согласны с ними.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Speed VPN. Все права защищены.</p>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Terms;