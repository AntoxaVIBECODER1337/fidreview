import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, HardHat, ListChecks, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'

const SLIDES = [
  {
    Icon: Sparkles,
    title: 'ИИ соберёт смету',
    text: 'Опишите задачу своими словами — «плитка в ванной 8 м²». ИИ подберёт материалы из каталога ОМА и посчитает три варианта сметы.',
    chips: ['3 комплекта', 'Расчёт по площади', 'В корзину в 1 тап'],
    from: '#1d5dbe',
    to: '#5b8fd9',
  },
  {
    Icon: HardHat,
    title: 'Бригады с гарантией',
    text: 'Официальная бригада ОМА и проверенные партнёры вашего города: рейтинг, отзывы, цена за м². Напишите бригаде ещё до оформления.',
    chips: ['Гарантия до 3 лет', 'Оплата после приёмки', 'Чат с бригадой'],
    from: '#174c9d',
    to: '#2e71d6',
  },
  {
    Icon: ListChecks,
    title: 'Проект с этапами',
    text: 'Замер → доставка материалов → черновые → чистовые работы. Каждый этап вы подтверждаете сами, смета не меняется.',
    chips: ['4 этапа', 'Фиксированная смета', 'Всё в одном месте'],
    from: '#123e80',
    to: '#1d5dbe',
  },
]

/** Онбординг при первом запуске: 3 карточки, свайп, «Пропустить». */
export default function Onboarding() {
  const { onboarded, setOnboarded } = useStore()
  const [[i, dir], setPage] = useState([0, 1])
  if (onboarded) return null

  const go = (n) => {
    if (n < 0 || n >= SLIDES.length) return
    setPage([n, n > i ? 1 : -1])
  }
  const finish = () => setOnboarded(true)
  const s = SLIDES[i]
  const last = i === SLIDES.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] mx-auto flex max-w-[430px] flex-col overflow-clip bg-white"
    >
      {/* Иллюстрация на градиенте */}
      <div
        className="relative flex h-[46dvh] min-h-[300px] items-center justify-center overflow-clip transition-[background] duration-500"
        style={{ background: `linear-gradient(160deg, ${s.from} 0%, ${s.to} 100%)` }}
      >
        <div className="mesh-blob absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_65%)] blur-xl" />
        <div className="mesh-blob absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(127,190,255,0.4),transparent_65%)] blur-xl [animation-delay:-7s]" />

        <button
          onClick={finish}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur"
        >
          Пропустить
        </button>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, scale: 0.7, rotate: dir * -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative"
          >
            <div className="flex h-36 w-36 items-center justify-center rounded-[40px] bg-white/15 shadow-[0_20px_60px_rgb(0_0_0/0.25)] backdrop-blur-md">
              <s.Icon size={68} strokeWidth={1.6} className="text-white" />
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 500, damping: 18 }}
              className="absolute -top-3 -right-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lift"
            >
              {i === 1 ? (
                <ShieldCheck size={22} className="text-brand-600" />
              ) : (
                <Star size={20} className="text-accent" fill="currentColor" />
              )}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Текст — листается свайпом */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(i + 1)
          else if (info.offset.x > 60) go(i - 1)
        }}
        className="flex flex-1 flex-col px-6 pt-7"
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[12px] font-bold tracking-wide text-brand-600 uppercase">
              {i + 1} из {SLIDES.length}
            </p>
            <h2 className="mt-1.5 text-[26px] leading-tight font-black text-navy">{s.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#3f4756]">{s.text}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.chips.map((c) => (
                <span key={c} className="rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-700">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Точки и кнопка */}
      <div className="flex items-center justify-between gap-4 px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-1.5">
          {SLIDES.map((_, n) => (
            <button
              key={n}
              onClick={() => go(n)}
              aria-label={`Карточка ${n + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                n === i ? 'w-6 bg-brand-600' : 'w-2 bg-line',
              )}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => (last ? finish() : go(i + 1))}
          className="flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 text-[15px] font-bold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)]"
        >
          {last ? 'Начать' : 'Далее'}
          <ArrowRight size={17} />
        </motion.button>
      </div>
    </motion.div>
  )
}
