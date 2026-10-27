import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, ScanBarcode, Zap } from 'lucide-react'
import { LEVELS, WELCOME_BONUS, cardNumber, levelFor, nextLevel } from '../lib/bonus'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import Sheet from './Sheet.jsx'

/** Штрихкод из номера карты (декоративный, стабильный для одного номера) */
function Barcode({ value, className }) {
  const digits = value.replace(/\D/g, '')
  const bars = []
  let x = 0
  for (let i = 0; i < 46; i++) {
    const d = Number(digits[i % digits.length]) + i
    const w = 1 + (d % 3)
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="60" />)
    x += w + 1
  }
  return (
    <svg viewBox={`0 0 ${x} 60`} preserveAspectRatio="none" className={className} fill="currentColor" aria-hidden>
      {bars}
    </svg>
  )
}

/** Виртуальная бонусная карта ОМА: баланс, уровень, кэшбэк, история */
export default function BonusCard() {
  const { user, bonus, demoLogin } = useStore()
  const [showCode, setShowCode] = useState(false)

  if (!user) {
    return (
      <div className="relative mt-4 overflow-clip rounded-2xl bg-[linear-gradient(135deg,#1e3a5c_0%,#1d5dbe_100%)] p-4 text-white">
        <span className="mesh-blob absolute -top-12 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_70%)]" />
        <p className="relative flex items-center gap-2 text-[15px] font-extrabold">
          <Gift size={18} /> Бонусная карта ОМА
        </p>
        <p className="relative mt-1 text-[12.5px] text-white/80">
          Кэшбэк баллами до 7% с каждой покупки. Войдите — и получите {WELCOME_BONUS} баллов сразу.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={demoLogin}
          className="relative mt-3 flex h-10 items-center gap-1.5 rounded-lg bg-white px-4 text-[13px] font-bold text-brand-700"
        >
          <Zap size={14} fill="currentColor" /> Получить карту
        </motion.button>
      </div>
    )
  }

  const level = levelFor(bonus.spent)
  const next = nextLevel(bonus.spent)
  const progress = next ? Math.min(100, ((bonus.spent - level.from) / (next.from - level.from)) * 100) : 100
  const number = cardNumber(user.phone)

  return (
    <div className="mt-4">
      {/* Карта */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowCode(true)}
        className="relative flex aspect-[1.586] w-full flex-col justify-between overflow-clip rounded-2xl bg-[linear-gradient(135deg,#123e80_0%,#1d5dbe_55%,#2e71d6_100%)] p-4 text-left text-white shadow-[0_14px_36px_rgb(29_93_190/0.38)]"
      >
        <span className="mesh-blob absolute -top-16 -right-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)]" />
        <span className="mesh-blob absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(245,135,31,0.35),transparent_70%)] [animation-delay:-6s]" />

        <span className="relative flex w-full items-start justify-between">
          <span>
            <span className="block text-[18px] font-black tracking-wide">ОМА Бонус</span>
            <span className="mt-0.5 block text-[11.5px] text-white/75">виртуальная карта</span>
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
            {level.name} · {level.rate}%
          </span>
        </span>

        <span className="relative flex w-full items-end justify-between">
          <span>
            <span className="block text-[11px] text-white/75">Баланс</span>
            <motion.span
              key={bonus.balance}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="block text-[30px] leading-none font-black"
            >
              {bonus.balance} <span className="text-[14px] font-bold text-white/80">баллов</span>
            </motion.span>
            <span className="mt-1.5 block font-mono text-[12px] tracking-[0.12em] text-white/80">{number}</span>
          </span>
          <span className="flex flex-col items-center gap-0.5 rounded-lg bg-white/15 px-2 py-1.5 backdrop-blur">
            <ScanBarcode size={20} />
            <span className="text-[9.5px] font-semibold">на кассе</span>
          </span>
        </span>
      </motion.button>

      {/* Уровень */}
      <div className="mt-3 rounded-xl border border-line bg-white p-3.5">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="font-bold text-navy">
            Кэшбэк {level.rate}% · {level.name}
          </span>
          <span className="text-muted">1 балл = 1 р.</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#1d5dbe,#f5871f)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] text-muted">
          {next
            ? `Ещё ${rub(Math.ceil(next.from - bonus.spent))} покупок — уровень «${next.name}» и ${next.rate}% кэшбэка`
            : 'Максимальный уровень — 7% кэшбэка с каждой покупки'}
        </p>
        <div className="mt-2.5 flex gap-1.5">
          {LEVELS.map((l) => (
            <span
              key={l.id}
              className={`flex-1 rounded-md py-1 text-center text-[10.5px] font-bold ${
                l.id === level.id ? 'bg-brand-600 text-white' : 'bg-panel text-muted'
              }`}
            >
              {l.name} {l.rate}%
            </span>
          ))}
        </div>
      </div>

      {/* История */}
      {bonus.history.length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-white px-3.5">
          {bonus.history.slice(0, 4).map((h) => (
            <div key={h.ts + h.type} className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0">
              <span className="min-w-0 truncate pr-2 text-[12.5px] text-navy">{h.text}</span>
              <span
                className={`shrink-0 text-[13px] font-extrabold ${h.amount >= 0 ? 'text-emerald-600' : 'text-price'}`}
              >
                {h.amount >= 0 ? '+' : ''}
                {h.amount}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCode && (
          <Sheet title="Карта для кассы" subtitle="Покажите кассиру — баллы начислятся автоматически" onClose={() => setShowCode(false)} maxH="70dvh">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-4 py-6">
              <Barcode value={number} className="h-24 w-full text-navy" />
              <span className="font-mono text-[16px] font-bold tracking-[0.18em] text-navy">{number}</span>
              <span className="text-[12.5px] text-muted">
                {user.name || user.phone} · {bonus.balance} баллов
              </span>
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
