import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import avatar from '../assets/avatar.jpg'
import { DEFAULT_TASK, SCENARIOS } from '../lib/ai'
import { products } from '../lib/catalog'
import { PrimaryButton, Tap, staggerChild, staggerParent } from './ui.jsx'

const LOADER_STEPS = [
  'Анализирую задачу…',
  `Подбираю товары из каталога ОМА (${products.length})…`,
  'Считаю варианты сметы…',
]

/**
 * Блок ИИ-помощника — скрипт вкладки «Главное» из oma-ozon:
 * mesh-градиент, поле задачи, лоадер с шагами, быстрые сценарии.
 * По окончании «подбора» зовёт onResult(task).
 */
export default function AIAssistant({ userName, onResult }) {
  const [task, setTask] = useState(DEFAULT_TASK)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    if (!loading) return undefined
    const t1 = setInterval(() => setStep((s) => Math.min(s + 1, LOADER_STEPS.length - 1)), 700)
    const t2 = setTimeout(() => {
      setLoading(false)
      setStep(0)
      onResultRef.current(task)
    }, 2100)
    return () => {
      clearInterval(t1)
      clearTimeout(t2)
    }
  }, [loading, task])

  const start = () => {
    if (task.trim() && !loading) setLoading(true)
  }

  return (
    <section className="relative overflow-hidden pb-10">
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
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start()
              }}
              rows={3}
              placeholder="Опишите задачу — ИИ подберёт товары из ОМА и посчитает смету"
              className="w-full resize-none rounded-xl border border-line bg-panel/60 p-3 text-[14px] leading-snug text-navy transition outline-none placeholder:text-muted focus:border-brand-600/40 focus:bg-white"
            />
            <PrimaryButton onClick={start} disabled={loading || !task.trim()} className="mt-4 w-full">
              <span className="flex items-center justify-center gap-2">
                {loading ? 'ИИ подбирает…' : 'Подобрать товары'}
                {!loading && <ArrowRight size={17} />}
              </span>
            </PrimaryButton>

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
                        {LOADER_STEPS[step]}
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
                  onClick={() => setTask(s.task)}
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
