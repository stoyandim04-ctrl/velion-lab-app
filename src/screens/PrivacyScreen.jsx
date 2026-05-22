import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'

export default function PrivacyScreen() {
  return (
    <Screen background="bg-cinema-soft">
      <div className="relative z-10 flex flex-col h-full">
        <Header />

        <div className="flex-1 overflow-y-auto px-7 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
              Политика
            </div>
            <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-display text-ink uppercase mb-6">
              ПОЛИТИКА ЗА
              <br />
              ПОВЕРИТЕЛНОСТ
            </h1>

            <p className="text-ink-dim text-xs mb-8">
              Последна актуализация: 22 май 2026 г.
            </p>

            <div className="space-y-7 text-ink-muted text-sm leading-relaxed">
              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  1. Кой обработва данните ти
                </h2>
                <p>
                  Velion Lab е приложение за личностна трансформация на мъже.
                  Ние сме администратор на личните данни, които ни предоставяш
                  при използване на приложението.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  2. Какви данни събираме
                </h2>
                <ul className="space-y-2 list-none">
                  <li>
                    <span className="text-accent">•</span> Имейл адрес при
                    регистрация
                  </li>
                  <li>
                    <span className="text-accent">•</span> Отговори от
                    онбординг въпросника
                  </li>
                  <li>
                    <span className="text-accent">•</span> Прогрес през 60-те
                    дни от курса
                  </li>
                  <li>
                    <span className="text-accent">•</span> Streak, активност и
                    последно отворен ден
                  </li>
                  <li>
                    <span className="text-accent">•</span> Записи в дневника
                    (само ти ги виждаш)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  3. Къде се съхраняват данните
                </h2>
                <p>
                  Всички данни се съхраняват сигурно в{' '}
                  <span className="text-ink">Supabase</span> — европейски
                  доставчик на бази данни с криптиране в покой и при
                  пренос. Имаш достъп само до собствените си данни чрез
                  Supabase Row Level Security.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  4. Плащания
                </h2>
                <p>
                  Плащанията се обработват от{' '}
                  <span className="text-ink">Stripe</span>. Ние не съхраняваме
                  данни от твоята карта. Stripe е сертифициран PCI DSS Level 1
                  доставчик.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  5. Споделяме ли данните ти
                </h2>
                <p>
                  Не. Не продаваме и не споделяме лични данни с трети страни
                  извън Supabase (база данни) и Stripe (плащания), които са
                  необходими за работата на приложението.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  6. Твоите права
                </h2>
                <ul className="space-y-2 list-none">
                  <li>
                    <span className="text-accent">•</span> Достъп до твоите
                    данни
                  </li>
                  <li>
                    <span className="text-accent">•</span> Корекция на
                    неточни данни
                  </li>
                  <li>
                    <span className="text-accent">•</span> Изтриване на
                    акаунта и всички данни
                  </li>
                  <li>
                    <span className="text-accent">•</span> Експорт на твоите
                    данни
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  7. Контакт
                </h2>
                <p>
                  За въпроси, искания за изтриване или жалби пиши на:
                </p>
                <p className="text-accent mt-2 text-base">
                  support@velion-lab.com
                </p>
              </section>

              <section className="pt-4 border-t border-forest-line">
                <p className="text-ink-dim text-xs">
                  Като използваш Velion Lab, ти потвърждаваш, че си прочел и
                  приемаш тази политика.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
