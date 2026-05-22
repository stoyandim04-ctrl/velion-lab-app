import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'

// Founder content lives here so it's trivial to update once the real
// founder photo, name and story are ready. Everything below is intentionally
// editable in one place — no other file references these values.
const FOUNDER = {
  name: 'Velion Lab Team',
  role: 'Основател на Velion Lab',
  location: 'София, България',
  photoUrl: '/founder/portrait.webp', // place a 800×800 webp here when ready
  email: 'velionbilgaria@gmail.com'
}

const STORY = [
  {
    title: 'Защо създадох Velion Lab',
    body: 'Velion Lab се роди от лична нужда. След години търсене на сериозна, нестрашна и нерязка работа върху мъжката увереност, открих че повечето ресурси са или прекалено медицински, или прекалено „мотивационни". Нямаше нещо, което да говори директно, без шум, на езика на един обикновен мъж от София.'
  },
  {
    title: 'Какво е различното',
    body: '60 дни структурирана работа върху нервната система, навиците и присъствието. Без обещания за чудеса. Без срам. Без излишна психология. Само ясен ритъм, конкретни упражнения и пространство, в което да си честен със себе си.'
  },
  {
    title: 'За кого е този курс',
    body: 'За мъжете между 25 и 45 г., които искат да възстановят контрола и спокойствието си — без да минават през терапевт или лекар. За хора, които предпочитат да работят сами, в свое темпо, със система, която реално носи резултат.'
  },
  {
    title: 'Какво обещавам',
    body: 'Това, което е в курса, е минало през мен самия. Това, което не работи, не е тук. Ако нещо ти се струва прекалено лесно или прекалено сложно — пиши ми директно. Velion Lab е жив проект и расте с feedback-а на хората, които реално вървят по него.'
  }
]

export default function FounderScreen() {
  return (
    <Screen background="bg-cinema-soft">
      <div className="relative z-10 flex flex-col h-full">
        <Header />

        <div className="flex-1 overflow-y-auto px-7 pb-12 overscroll-contain scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-display text-accent text-[11px] tracking-[0.15em] uppercase mb-3">
              Зад протокола
            </div>
            <h1 className="font-display font-bold text-[30px] leading-[1.05] tracking-display text-ink uppercase mb-6">
              ЗА ОСНОВАТЕЛЯ
            </h1>

            <FounderCard />

            <div className="space-y-7 text-ink-muted text-sm leading-relaxed mt-8">
              {STORY.map((section, i) => (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                >
                  <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                    {section.title}
                  </h2>
                  <p>{section.body}</p>
                </motion.section>
              ))}

              <section className="pt-5 border-t border-forest-line">
                <h2 className="font-display text-ink text-base uppercase tracking-[0.05em] mb-2">
                  Пиши директно
                </h2>
                <p className="mb-3">
                  Velion Lab не е безлична машина. Ако имаш въпрос, идея или искаш да
                  споделиш опит — пиши.
                </p>
                <a
                  href={`mailto:${FOUNDER.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2.5 text-accent font-display text-[12px] font-bold uppercase tracking-[0.12em] active:scale-95 transition"
                >
                  <Mail size={14} />
                  {FOUNDER.email}
                </a>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Screen>
  )
}

function FounderCard() {
  return (
    <div className="rounded-3xl border border-forest-line bg-forest-card p-5 flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-accent/30 bg-gradient-to-br from-accent/15 to-forest-deep flex items-center justify-center shrink-0">
        <img
          src={FOUNDER.photoUrl}
          alt={FOUNDER.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Graceful fallback if the photo isn't uploaded yet — show the
            // brand shield instead of a broken image icon.
            e.currentTarget.style.display = 'none'
          }}
        />
        <img
          src="/logo/velion-shield.svg"
          alt=""
          className="absolute w-10 h-10 opacity-60"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display font-bold text-ink text-[16px] tracking-display uppercase leading-tight">
          {FOUNDER.name}
        </div>
        <div className="text-ink-muted text-[12px] mt-1 leading-snug">
          {FOUNDER.role}
        </div>
        <div className="text-ink-dim text-[11px] mt-0.5">
          {FOUNDER.location}
        </div>
      </div>
    </div>
  )
}
