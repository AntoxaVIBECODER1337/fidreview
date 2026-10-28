import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DECOR_PACKS, packFromPrice } from '../lib/decor'
import { rub } from '../lib/format'
import { staggerChild, staggerParent } from './ui.jsx'
import PackIcon from './PackIcon.jsx'

/** Карточка пакета декора */
export function PackCard({ pack, wide = false }) {
  return (
    <Link to={`/decor/${pack.id}`} className="block h-full hide-tap">
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 550, damping: 28 }}
        className="relative flex h-full flex-col overflow-clip rounded-2xl p-3.5 text-white shadow-soft"
        style={{ background: `linear-gradient(150deg, ${pack.from} 0%, ${pack.to} 100%)` }}
      >
        <span className="mesh-blob absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)]" />
        <span className="relative block leading-none">
          <PackIcon emoji={pack.emoji} size={34} />
        </span>
        <span className="relative mt-3 block text-[16px] leading-tight font-black">{pack.name}</span>
        {wide && <span className="relative mt-1 block text-[12px] leading-snug text-white/85">{pack.desc}</span>}
        <span className="relative mt-auto pt-3 text-[11.5px] font-semibold text-white/85">
          {pack.slots.length} позиций от <b className="text-white">{rub(packFromPrice(pack))}</b>
        </span>
      </motion.div>
    </Link>
  )
}

/** Лента «Пакеты декора» на главной */
export function DecorPacksRow() {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-end justify-between px-4">
        <div>
          <h2 className="text-[18px] font-bold text-navy">Пакеты декора</h2>
          <p className="text-[12px] text-muted">Готовые наборы для комнаты — соберите свой</p>
        </div>
        <Link to="/decor" className="shrink-0 text-[12px] font-medium text-brand-600">
          Все
        </Link>
      </div>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1"
      >
        {DECOR_PACKS.map((p) => (
          <motion.div key={p.id} variants={staggerChild} className="w-[150px] shrink-0">
            <PackCard pack={p} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
