import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, HardHat, Ruler, Sparkles, Star, Users, X } from 'lucide-react'
import { crewSnapshot, crewsForCity, specialtyLabel, startLabel } from '../data/crews'
import { kitTotal } from '../lib/ai'
import { useStore } from '../store/StoreContext'
import { cn } from '../lib/cn'
import { rub } from '../lib/format'

/**
 * Шторка «Подборка ОМА» (перенос AIResultSheet из oma-ozon):
 * 3 комплекта с чекбоксами товаров и итог.
 * mode='buy' — закупка: всё в корзину.
 * mode='project' — проект ремонта: своими силами или с бригадой.
 */
export default function AIResultSheet({ task, mode = 'project', result, onClose, onToCart, onToProject }) {
  const isProject = mode === 'project'
  const { kits, area, scenario, recognized } = result
  const { city } = useStore()
  /* Бригады города: ОМА первая, затем 2 лучших партнёра под задачу */
  const crews = useMemo(() => {
    const bySpec = crewsForCity(city, { specialty: scenario.id })
    const any = crewsForCity(city)
    const oma = bySpec.oma ?? any.oma
    const partners = (bySpec.partners.length ? bySpec.partners : any.partners).slice(0, oma ? 2 : 3)
    return oma ? [oma, ...partners] : partners
  }, [city, scenario.id])
  const [kitId, setKitId] = useState('std')
  const [withCrew, setWithCrew] = useState(false)
  const [crewId, setCrewId] = useState(crews[0]?.id)
  const [expanded, setExpanded] = useState('std')
  const [excluded, setExcluded] = useState(() => new Set())

  const kit = kits.find((k) => k.id === kitId)
  const crew = crews.find((c) => c.id === crewId) ?? crews[0]

  const itemsTotal = useMemo(() => kitTotal(kit.items, excluded), [kit, excluded])
  const crewTotal = withCrew && crew ? crew.rate * area : 0
  const grand = itemsTotal + crewTotal
  const chosen = kit.items.filter((i) => !excluded.has(i.id))

  const toggleItem = (id) =>
    setExcluded((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const submit = () => {
    if (!chosen.length) return
    if (!isProject) onToCart(chosen)
    else onToProject({ items: chosen, crew: withCrew && crew ? crewSnapshot(crew) : null, area })
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => info.offset.y > 110 && onClose()}
        className="relative flex max-h-[93dvh] flex-col rounded-t-3xl bg-white shadow-lift"
      >
        {/* Шапка */}
        <div className="shrink-0 px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-brand-600" />
                <h2 className="text-[19px] font-black text-navy">
                  {isProject ? 'Проект ремонта' : 'Закупка материалов'}
                </h2>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted">«{task}»</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel transition-colors active:bg-line"
            >
              <X size={17} className="text-muted" />
            </button>
          </div>

          {/* Что понял ИИ */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              <scenario.Icon size={12} />
              {recognized ? scenario.name : `${scenario.name} (по умолчанию)`}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-navy">
              <Ruler size={12} className="text-muted" />
              {area} м²
            </span>
          </div>

          {/* Тумблер: своими силами / с бригадой — только для проекта */}
          {isProject && (
          <div className="mt-3 flex rounded-xl bg-panel p-1">
            {[
              { v: false, label: 'Своими силами' },
              { v: true, label: 'С бригадой ОМА' },
            ].map((o) => (
              <button
                key={o.label}
                onClick={() => setWithCrew(o.v)}
                className={cn(
                  'relative flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-colors',
                  withCrew === o.v ? 'text-white' : 'text-muted',
                )}
              >
                {withCrew === o.v && (
                  <motion.span
                    layoutId="crew-toggle"
                    className="absolute inset-0 rounded-lg bg-brand-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10">{o.label}</span>
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Содержимое */}
        <div className="scroll-area flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-2">
            {kits.map((k) => {
              const isSel = kitId === k.id
              const isOpen = expanded === k.id
              return (
                <div
                  key={k.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border-2 transition-colors duration-200',
                    isSel ? 'border-brand-600 bg-brand-50/50' : 'border-line bg-white',
                  )}
                >
                  <button
                    onClick={() => {
                      setKitId(k.id)
                      setExcluded(new Set())
                      setExpanded(isSel && isOpen ? null : k.id)
                    }}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={cn(
                        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isSel ? 'border-brand-600 bg-brand-600' : 'border-line bg-white',
                      )}
                    >
                      {isSel && <Check size={13} className="text-white" strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[15px] font-extrabold text-navy">{k.name}</span>
                        {k.badge && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                            {k.badge}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted">
                        {k.items.length} поз. • {rub(kitTotal(k.items))}
                      </span>
                    </span>
                    <ChevronDown
                      size={17}
                      className={cn(
                        'shrink-0 text-muted transition-transform duration-200',
                        isOpen && isSel && 'rotate-180',
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && isSel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-line/80 px-3 pt-1.5 pb-2">
                          <p className="px-1.5 pt-1 pb-1 text-[11px] text-muted">{k.desc}</p>
                          {k.items.map(({ id, qty, product: p }) => {
                            const on = !excluded.has(id)
                            return (
                              <button
                                key={id}
                                onClick={() => toggleItem(id)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left transition-colors active:bg-panel"
                              >
                                <span
                                  className={cn(
                                    'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors',
                                    on ? 'border-brand-600 bg-brand-600' : 'border-line bg-white',
                                  )}
                                >
                                  {on && <Check size={11} className="text-white" strokeWidth={3.5} />}
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel text-[17px]">
                                  {p.emoji}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[12.5px] font-semibold text-navy">
                                    {p.name}
                                  </span>
                                  <span className="block truncate text-[10.5px] text-muted">
                                    {p.brand} • {rub(p.price)} / {p.unit}
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span
                                    className={cn(
                                      'block text-[12.5px] font-bold',
                                      on ? 'text-navy' : 'text-muted line-through',
                                    )}
                                  >
                                    {rub(Math.round(p.price * qty * 100) / 100)}
                                  </span>
                                  <span className="block text-[10px] text-muted">×{qty}</span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Бригады */}
          <AnimatePresence>
            {withCrew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-1">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <Users size={15} className="text-brand-600" />
                    <span className="text-[13px] font-bold text-navy">
                      Бригады в г. {city} • на {area} м²
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {crews.map((c) => (
                      <CrewCard
                        key={c.id}
                        crew={c}
                        area={area}
                        selected={crewId === c.id}
                        onClick={() => setCrewId(c.id)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-3 px-1 text-center text-[11px] leading-relaxed text-muted">
            {isProject
              ? 'Проект появится в «Моём доме» с этапами работ. Все бригады города и отзывы — во вкладке «Бригады»: там бригаду можно выбрать или сменить.'
              : 'Товары попадут в корзину и зарезервируются в магазине ОМА. Хотите с бригадой — выберите «Проект ремонта».'}
          </p>
        </div>

        {/* Итог */}
        <div className="shrink-0 border-t border-line bg-white px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-2.5 flex items-baseline justify-between gap-2 px-1">
            <span className="text-[12.5px] font-semibold text-muted">
              Товары {rub(round2(itemsTotal))}
              {withCrew && <span className="text-brand-600"> + работа {rub(crewTotal)}</span>}
            </span>
            <span className="text-[17px] font-black whitespace-nowrap text-navy">
              {rub(round2(grand))}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 550, damping: 28 }}
            onClick={submit}
            disabled={!chosen.length}
            className="h-12 w-full rounded-lg bg-brand-600 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)] transition-colors duration-150 active:bg-brand-700 disabled:opacity-50"
          >
            {!isProject ? 'Всё в корзину' : withCrew ? 'Создать проект с бригадой' : 'Создать проект'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

const round2 = (n) => Math.round(n * 100) / 100

function CrewCard({ crew, area, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 p-3 text-left transition-colors',
        selected ? 'border-brand-600 bg-brand-50/50' : crew.isOma ? 'border-brand-600/40 bg-brand-50/30' : 'border-line bg-white',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white transition-colors',
          crew.isOma || selected ? 'bg-brand-600' : 'bg-muted/50',
        )}
      >
        {crew.isOma ? <HardHat size={18} /> : crew.name.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] font-extrabold text-navy">{crew.name}</span>
          <span className="flex items-center gap-0.5 text-[11.5px] font-bold text-accent">
            <Star size={11} fill="currentColor" />
            {crew.rating}
          </span>
          <span className="text-[10.5px] text-muted">({crew.reviews})</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">
          {crew.isOma ? (
            <span className="font-bold text-brand-600">Официальная бригада ОМА • </span>
          ) : (
            `${specialtyLabel(crew.specialties[0])} • `
          )}
          {crew.rate} р./м² • {startLabel(crew.startDays)}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 text-[13px] font-black whitespace-nowrap',
          selected ? 'text-brand-600' : 'text-navy',
        )}
      >
        {rub(crew.rate * area)}
      </span>
    </button>
  )
}
