import { motion } from 'framer-motion'
import { BadgeCheck, Clock, HardHat, ShieldCheck, Star, Store } from 'lucide-react'
import { specialtyLabel, startLabel } from '../data/crews'
import { cn } from '../lib/cn'
import { QuickContact } from './CrewContacts.jsx'

/** Карточка бригады в списке. Бригада ОМА — крупная, на бренд-градиенте. */
export default function CrewCard({ crew, onOpen, onChat, highlightSpecialty }) {
  if (crew.isOma) return <OmaCrewCard crew={crew} onOpen={onOpen} onChat={onChat} />

  return (
    <div className="rounded-xl border border-line/70 bg-white shadow-soft">
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
      onClick={onOpen}
      className="flex w-full flex-col gap-2.5 p-4 pb-3 text-left"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel text-[15px] font-black text-navy">
          {crew.name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-extrabold text-navy">{crew.name}</span>
            <BadgeCheck size={15} className="shrink-0 text-brand-600" aria-label="Проверено ОМА" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted">
            <span className="flex items-center gap-0.5 font-bold text-accent">
              <Star size={11} fill="currentColor" />
              {crew.rating}
            </span>
            <span>{crew.reviews} отзывов</span>
            <span>•</span>
            <span>{crew.done} проектов</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[16px] leading-none font-black text-navy">{crew.rate} р.</div>
          <div className="mt-1 text-[10.5px] text-muted">за м²</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {crew.specialties.slice(0, 4).map((s) => (
          <span
            key={s}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
              s === highlightSpecialty ? 'bg-brand-600 text-white' : 'bg-panel text-navy',
            )}
          >
            {specialtyLabel(s)}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-2.5 text-[11.5px]">
        <span className="flex items-center gap-1 text-muted">
          <Store size={12} /> Продавец на ОМА
        </span>
        <span className="flex items-center gap-1 font-semibold text-navy">
          <Clock size={12} className="text-muted" /> {startLabel(crew.startDays)}
        </span>
      </div>
    </motion.button>
    <QuickContact crew={crew} onChat={onChat} className="px-4 pb-4" />
    </div>
  )
}

function OmaCrewCard({ crew, onOpen, onChat }) {
  return (
    <div className="relative overflow-clip rounded-2xl bg-[linear-gradient(135deg,#1d5dbe_0%,#174c9d_60%,#123e80_100%)] text-white shadow-[0_10px_30px_rgb(29_93_190/0.35)]">
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
      onClick={onOpen}
      className="relative w-full p-4 pb-3 text-left"
    >
      <span className="mesh-blob absolute -top-16 -right-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)]" />
      <span className="relative flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-black tracking-wide text-brand-700 uppercase">
          <HardHat size={12} /> Официальная бригада ОМА
        </span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-bold">в вашем городе</span>
      </span>

      <span className="relative mt-3 flex items-end justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[20px] leading-tight font-black">{crew.name}</span>
          <span className="mt-1 flex items-center gap-1.5 text-[12px] text-white/85">
            <span className="flex items-center gap-0.5 font-bold text-white">
              <Star size={12} fill="currentColor" className="text-accent" />
              {crew.rating}
            </span>
            {crew.reviews.toLocaleString('ru-RU')} отзывов • {crew.done.toLocaleString('ru-RU')} проектов
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[20px] leading-none font-black">{crew.rate} р.</span>
          <span className="mt-1 block text-[10.5px] text-white/75">за м²</span>
        </span>
      </span>

      <span className="relative mt-3 grid grid-cols-1 gap-1.5">
        {crew.perks.map((p) => (
          <span key={p} className="flex items-center gap-1.5 text-[12px] font-semibold">
            <ShieldCheck size={14} className="shrink-0 text-white/90" /> {p}
          </span>
        ))}
      </span>

      <span className="relative mt-3 flex items-center justify-between border-t border-white/20 pt-2.5 text-[11.5px]">
        <span className="text-white/80">Ответ за {crew.responseMin} мин</span>
        <span className="flex items-center gap-1 font-bold">
          <Clock size={12} /> {startLabel(crew.startDays)}
        </span>
      </span>
    </motion.button>
    <QuickContact crew={crew} onChat={onChat} variant="dark" className="relative px-4 pb-4" />
    </div>
  )
}
