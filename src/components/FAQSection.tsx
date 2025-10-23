import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const faqs: FAQ[] = [
    {
      question: "Что такое VPN и зачем он нужен?",
      answer: "VPN (Virtual Private Network) — это защищённое соединение, которое шифрует ваш интернет-трафик и скрывает ваш IP-адрес. Это обеспечивает конфиденциальность, безопасность и доступ к контенту без географических ограничений."
    },
    {
      question: "На скольких устройствах я могу использовать VPN?",
      answer: "Количество устройств зависит от выбранного тарифа. Базовый план поддерживает до 5 устройств, Про — до 10, а Премиум — неограниченное количество устройств одновременно."
    },
    {
      question: "Влияет ли VPN на скорость интернета?",
      answer: "Наш VPN оптимизирован для максимальной скорости. На тарифах Про и Премиум вы получаете приоритетный доступ к серверам, что обеспечивает минимальное влияние на скорость соединения."
    },
    {
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем все основные банковские карты, электронные кошельки и криптовалюту. Оплата полностью безопасна и защищена."
    },
    {
      question: "Могу ли я отменить подписку?",
      answer: "Да, вы можете отменить подписку в любой момент. При этом доступ к сервису сохранится до конца оплаченного периода."
    }
  ];

  return (
    <section className="py-20 px-4 bg-black/30" id="faq">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">Часто задаваемые вопросы</h2>
          <p className="text-xl text-muted-foreground">
            Ответы на самые популярные вопросы о нашем сервисе
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-2 border-border rounded-xl px-6 data-[state=open]:border-primary transition-all">
              <AccordionTrigger className="text-lg font-bold hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
