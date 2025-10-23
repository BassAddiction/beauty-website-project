import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface FAQ {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  const faqs: FAQ[] = [
    {
      question: "Что такое VPN и зачем он нужен?",
      answer: "VPN (Virtual Private Network) — это защищённое соединение, которое шифрует ваш интернет-трафик и скрывает ваш IP-адрес. Это обеспечивает конфиденциальность, безопасность и доступ к контенту без географических ограничений."
    },
    {
      question: "На скольких устройствах я могу использовать VPN?",
      answer: "Все наши тарифы поддерживают неограниченное количество устройств одновременно. Подключайте столько устройств, сколько вам нужно."
    },
    {
      question: "Есть ли ограничения по трафику?",
      answer: "30 ГБ трафика в сутки в любых локациях — это более чем достаточно для комфортного использования VPN. Вы можете свободно пользоваться всеми сервисами без ограничений."
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
    <section ref={ref} className="py-20 px-4 bg-black/30" id="faq">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-4">Часто задаваемые вопросы</h2>
          <p className="text-xl text-muted-foreground">
            Ответы на самые популярные вопросы о нашем сервисе
          </p>
        </div>

        <Accordion type="single" collapsible className={`space-y-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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