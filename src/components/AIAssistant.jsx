import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Hammer, ShoppingCart, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import avatar from '../assets/avatar.jpg'
import { DEFAULT_TASK, SCENARIOS } from '../lib/ai'
import { products } from '../lib/catalog'
import { useStore } from '../store/StoreContext'
import { PrimaryButton, Tap, staggerChild, staggerParent } from './ui.jsx'

const LOADER_STEPS = {
  project: [
    'Анализирую задачу…',
    `Подбираю материалы из каталога ОМА (${products.length})…`,
    'Планирую этапы работ и смету…',
  ],
  buy: ['Анализирую задачу…', `Подбираю товары из каталога ОМА (${products.length})…`, 'Считаю количество…'],
}

/** Вопрос ИИ после ввода задачи */
const CHOICES = [
  {
    mode: 'project',
    Icon: Hammer,
    title: 'Проект ремонта',
    desc: 'Смета, этапы работ и бригада',
  },
  {
    mode: 'buy',
    Icon: ShoppingCart,
    title: 'Только закупка',
    desc: 'Подберу материалы в корзину',
  },
]

/**
 * Блок ИИ-помощника — скрипт вкладки «Главное» из oma-ozon:
 * mesh-градиент, поле задачи, лоадер с шагами, быстрые сценарии.
 * По окончании «подбора» зовёт onResult(task).
 */
export default function AIAssistant({ onResult }) {
  const { user } = useStore()
  const userName = user?.name?.split(' ')[0]
  const { state } = useLocation()
  /* Задача может прийти из «Моей планировки» (кнопка «Ремонт этой комнаты с ИИ») */
  const [task, setTask] = useState(state?.task ?? DEFAULT_TASK)
  /* input → ask (ИИ уточняет: проект или закупка) → loading */
  const [phase, setPhase] = useState('input')
  const [mode, setMode] = useState(null)
  const [step, setStep] = useState(0)
  const loading = phase === 'loading'
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (!loading) return undefined
    const steps = LOADER_STEPS[mode]
    const t1 = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 700)
    const t2 = setTimeout(() => {
      setPhase('input')
      setStep(0)
      onResultRef.current(task, mode)
    }, 2100)
    return () => {
      clearInterval(t1)
      clearTimeout(t2)
    }
  }, [loading, task, mode])

  const start = () => {
    if (task.trim() && phase === 'input') setPhase('ask')
  }

  const choose = (m) => {
    setMode(m)
    setPhase('loading')
  }

  return (
    <section className="relative overflow-clip pb-10">
      {/* Mesh-градиент */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1d5dbe_0%,#4a84d4_58%,#76a3e2_86%,#ffffff_100%)]" />
      <div className="mesh-blob absolute -top-32 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(127,190,255,0.55),transparent_65%)] blur-2xl" />
      <div className="mesh-blob absolute top-24 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(23,76,157,0.5),transparent_65%)] blur-2xl [animation-delay:-7s]" />

      <div className="relative z-10">
        {/* Шапка */}
        <header className="flex h-16 items-center justify-between px-4">
          <h1 className="text-[20px] font-black tracking-tight text-white">Мой дом</h1>
          <Link
            to="/profile"
            aria-label="Профиль"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/20 shadow-glass backdrop-blur-md hide-tap"
          >
            <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" draggable={false} />
          </Link>
        </header>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 px-4 pt-2"
        >
          <motion.p variants={staggerChild} className="text-[15px] font-semibold text-white/90">
            Здравствуйте{userName ? `, ${userName}` : ''} 👋
          </motion.p>

          {/* Карточка ввода */}
          <motion.div
            variants={staggerChild}
            className="rounded-3xl border border-white/50 bg-white/95 p-5 shadow-lift backdrop-blur"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                <Sparkles size={17} className="text-brand-600" />
              </span>
              <h2 className="text-[17px] font-bold text-navy">Что нужно сделать?</h2>
            </div>
            <textarea
              value={task}
              onChange={(e) => {
                setTask(e.target.value)
                if (phase === 'ask') setPhase('input')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start()
              }}
              rows={3}
              placeholder="Опишите задачу — ИИ подберёт товары из ОМА и посчитает смету"
              className="w-full resize-none rounded-xl border border-line bg-panel/60 p-3 text-[14px] leading-snug text-navy transition outline-none placeholder:text-muted focus:border-brand-600/40 focus:bg-white"
            />
            <AnimatePresence initial={false} mode="wait">
              {phase === 'ask' ? (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4"
                >
                  {/* Реплика ИИ */}
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600">
                      <Sparkles size={14} className="text-white" />
                    </span>
                    <p className="rounded-2xl rounded-tl-md bg-brand-50 px-3 py-2 text-[13.5px] leading-snug font-semibold text-navy">
                      Понял задачу! Делаем из этого проект ремонта или просто закупаем материалы?
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {CHOICES.map((c, i) => (
                      <motion.button
                        key={c.mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 420, damping: 30 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => choose(c.mode)}
                        className={`flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3 text-left transition-colors ${
                          c.mode === 'project'
                            ? 'border-brand-600 bg-brand-600 text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)]'
                            : 'border-brand-600/30 bg-white text-navy active:bg-brand-50'
                        }`}
                      >
                        <c.Icon size={20} className={c.mode === 'project' ? 'text-white' : 'text-brand-600'} />
                        <span className="text-[14px] leading-tight font-extrabold">{c.title}</span>
                        <span
                          className={`text-[11.5px] leading-snug ${c.mode === 'project' ? 'text-white/80' : 'text-muted'}`}
                        >
                          {c.desc}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPhase('input')}
                    className="mt-2 w-full py-1 text-center text-[12px] font-semibold text-muted"
                  >
                    Изменить задачу
                  </button>
                </motion.div>
              ) : (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PrimaryButton onClick={start} disabled={loading || !task.trim()} className="mt-4 w-full">
                    <span className="flex items-center justify-center gap-2">
                      {loading ? 'ИИ подбирает…' : 'Подобрать с ИИ'}
                      {!loading && <ArrowRight size={17} />}
                    </span>
                  </PrimaryButton>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Мини-лоадер со сменой шагов */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50/80 px-3 py-2.5">
                    <span className="relative flex h-4 w-4 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-600/40" />
                      <span className="relative inline-flex h-4 w-4 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={step}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-[13px] font-medium text-brand-700"
                      >
                        {LOADER_STEPS[mode]?.[step]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Быстрые сценарии */}
          <motion.div variants={staggerChild}>
            <p className="mb-2 px-1 text-[13px] font-semibold text-white/85">Популярное</p>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
              {SCENARIOS.map((s) => (
                <Tap
                  key={s.id}
                  onClick={() => {
                    setTask(s.task)
                    if (phase === 'ask') setPhase('input')
                  }}
                  disabled={loading}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 backdrop-blur-md transition-colors ${
                    task === s.task
                      ? 'border-white bg-white text-brand-700'
                      : 'border-white/35 bg-white/15 text-white active:bg-white/30'
                  }`}
                >
                  <s.Icon size={16} />
                  <span className="text-[12.5px] font-semibold">{s.name}</span>
                </Tap>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
