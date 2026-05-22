import { motion } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'

export default function TermsScreen() {
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
              Условия
            </div>
            <h1 className="font-display font-bold text-[32px] leading-[1.05] tracking-display text-ink uppercase mb-6">
              ОБЩИ УСЛОВИЯ
            </h1>

            <p className="text-ink-dim text-xs mb-8">
              Последна актуализация: 22 май 2026 г.
            </p>

            <div className="space-y-7 text-ink-muted text-sm leading-relaxed">
              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  1. За приложението
                </h2>
                <p>
                  Velion Lab е дигитален курс от 60 дни за личностна
                  трансформация на мъже — структуриран опит, включващ уроци,
                  упражнения, рефлексия и дневник. Не е медицинска или
                  психотерапевтична услуга.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  2. Регистрация и акаунт
                </h2>
                <p>
                  За да използваш приложението, трябва да си навършил 18
                  години и да създадеш акаунт с валиден имейл. Ти си отговорен
                  за сигурността на своите данни за вход.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  3. Достъп и абонамент
                </h2>
                <p>
                  Достъпът до пълния курс е срещу заплащане. Плащанията се
                  обработват от Stripe. Абонаментите се подновяват автоматично
                  до отказ. Можеш да отмениш по всяко време от настройките на
                  акаунта или като пишеш на support@velion-lab.com.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  4. Възстановяване на средства
                </h2>
                <p>
                  Имаш право на пълно възстановяване в рамките на 14 дни от
                  първоначалното плащане, ако курсът не отговаря на твоите
                  очаквания. Пиши ни на имейла за поддръжка.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  5. Интелектуална собственост
                </h2>
                <p>
                  Цялото съдържание — текстове, изображения, упражнения,
                  структура на курса — е собственост на Velion Lab. Не можеш
                  да копираш, разпространяваш или препродаваш материалите без
                  писмено разрешение.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  6. Лична отговорност
                </h2>
                <p>
                  Курсът предлага рамка за личностно развитие, но резултатите
                  зависят изцяло от твоя ангажимент и обстоятелства. Velion
                  Lab не гарантира конкретни резултати и не носи отговорност
                  за решения, които вземаш на базата на съдържанието.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  7. Прекратяване на достъп
                </h2>
                <p>
                  Запазваме си правото да прекратим или ограничим достъп при
                  нарушаване на тези условия, злоупотреба или измамна
                  активност.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  8. Промени в условията
                </h2>
                <p>
                  Можем да актуализираме тези условия от време на време.
                  Съществените промени ще се обявяват в приложението или по
                  имейл.
                </p>
              </section>

              <section>
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  9. Контакт
                </h2>
                <p>За въпроси относно тези условия:</p>
                <p className="text-accent mt-2 text-base">
                  support@velion-lab.com
                </p>
              </section>

              <section className="pt-4 border-t border-forest-line">
                <p className="text-ink-dim text-xs">
                  Като използваш Velion Lab, ти потвърждаваш, че си прочел и
                  приемаш тези условия.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}
