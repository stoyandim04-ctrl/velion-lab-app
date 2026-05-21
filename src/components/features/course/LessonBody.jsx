import { motion } from 'framer-motion'
import SectionLabel from './SectionLabel.jsx'

function renderText(text, highlight) {
  if (!highlight || !text.includes(highlight)) return text
  const [before, after] = text.split(highlight)
  return (
    <>
      {before}
      <span className="text-accent font-semibold">{highlight}</span>
      {after}
    </>
  )
}

export default function LessonBody({ lesson, onRead, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      onViewportEnter={onRead}
    >
      <SectionLabel icon={lesson.icon} title={lesson.title} duration={lesson.duration} />
      <div className="rounded-3xl border border-forest-line bg-forest-card overflow-hidden">
        {lesson.image && (
          <div className="aspect-square sm:aspect-[4/5] w-full bg-forest-deep overflow-hidden">
            <img
              src={lesson.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
        <div className="p-6 space-y-5">
          {lesson.intro && (
            <p className="text-ink/90 text-[16px] leading-[1.7]">
              {renderText(lesson.intro, lesson.highlight)}
            </p>
          )}

          {lesson.paragraphs && lesson.paragraphs.map((p, i) => (
            <p key={i} className="text-ink/90 text-[16px] leading-[1.7]">
              {renderText(p, lesson.highlight)}
            </p>
          ))}

          {lesson.bullets && (
            <ul className="space-y-3">
              {lesson.bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display font-semibold text-accent text-xs tracking-[0.05em] w-12 flex-shrink-0 pt-0.5">
                    Ден {b.day}
                  </span>
                  <span className="text-ink/90 text-[15px] leading-[1.6]">{b.text}</span>
                </li>
              ))}
            </ul>
          )}

          {children}

          {lesson.outro && (
            <p className="text-ink/90 text-[16px] leading-[1.7] pt-4 border-t border-forest-line/60 mt-3">
              {lesson.outro}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
