import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, HelpCircle, PackageCheck, RotateCcw, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { Tap } from '../components/ui.jsx'
import { getProduct } from '../lib/catalog'
import { cn } from '../lib/cn'
import { getPack, minSlots, packFromPrice, packItems, packPrice, round2 } from '../lib/decor'
import { flyToCart } from '../lib/fly'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'

/**
 * Конструктор пакета декора: у каждой позиции 5 вариантов из каталога
 * (3 без доплаты, 2 с доплатой). Позиции можно убрать, но в пакете
 * должно остаться не меньше половины. Готовый пакет — в корзину.
 */
export default function DecorPackPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pack = getPack(id)
  const { addBundle, showToast } = useStore()
  /* { [slotId]: индекс варианта | null — позиция убрана } */
  const [choice, setChoice] = useState({})
  const [open, setOpen] = useState(null)
  const [added, setAdded] = useState(false)

  const total = useMemo(() => (pack ? packPrice(pack, choice) : 0), [pack, choice])

  if (!pack) {
    return (
      <div>
        <Header back title="Пакеты декора" />
        <EmptyState icon={HelpCircle} title="Пакет не найден" buttonLabel="Все пакеты" to="/decor" />
      </div>
    )
  }

  const n = pack.slots.length
  const min = minSlots(pack)
  const kept = pack.slots.filter((s) => choice[s.id] !== null).length
  const canRemove = kept > min
  const base = packFromPrice(pack)
  const extra = round2(
    pack.slots.reduce((s, slot) => {
      const v = choice[slot.id]
      if (v === null || !v) return s
      return s + getProduct(slot.variants[v]).price - getProduct(slot.variants[0]).price
    }, 0),
  )

  const pick = (slotId, v) => {
    setChoice((c) => ({ ...c, [slotId]: v }))
    setAdded(false)
  }

  const remove = (slotId) => {
    if (!canRemove) {
      showToast(`В пакете должно остаться не меньше ${min} из ${n} позиций`)
      return
    }
    setChoice((c) => ({ ...c, [slotId]: null }))
    if (open === slotId) setOpen(null)
    setAdded(false)
  }

  const restore = (slotId) => {
    setChoice((c) => ({ ...c, [slotId]: 0 }))
    setAdded(false)
  }

  const toCart = (e) => {
    addBundle({ packId: pack.id, title: pack.name, emoji: pack.emoji, items: packItems(pack, choice) })
    flyToCart(e.currentTarget, pack.emoji)
    setAdded(true)
  }

  return (
    <div className="min-h-dvh bg-bg pb-48">
      <Header back title={`Пакет «${pack.name}»`} />

      {/* Обложка пакета */}
      <section
        className="relative mx-4 mt-4 overflow-clip rounded-2xl p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${pack.from} 0%, ${pack.to} 100%)` }}
      >
        <span className="mesh-blob absolute -top-14 -right-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25),transparent_70%)]" />
        <div className="relative flex items-start gap-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-[36px] backdrop-blur">
            {pack.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-white/75 uppercase">Пакет декора · {pack.room}</p>
            <h1 className="text-[22px] leading-tight font-black">{pack.name}</h1>
            <p className="mt-1 text-[12.5px] leading-snug text-white/85">{pack.desc}</p>
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11.5px] font-semibold">
          <span className="rounded-full bg-white/20 px-2.5 py-1">{n} позиций</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">по 5 вариантов</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">от {rub(base)}</span>
        </div>
      </section>

      <p className="mx-5 mt-3 text-[12px] leading-snug text-muted">
        Нажмите на позицию, чтобы выбрать вариант. Лишнее можно убрать — в пакете должно остаться не меньше{' '}
        <b className="text-navy">
          {min} из {n}
        </b>{' '}
        позиций.
      </p>

      {/* Позиции */}
      <ul className="mt-3 flex flex-col gap-2.5 px-4">
        {pack.slots.map((slot) => {
          const v = choice[slot.id]
          const removed = v === null
          const idx = v ?? 0
          const product = getProduct(slot.variants[idx])
          const isOpen = open === slot.id && !removed
          return (
            <motion.li
              key={slot.id}
              layout
              className={cn(
                'overflow-clip rounded-xl border bg-white shadow-soft transition-colors',
                removed ? 'border-dashed border-line bg-white/60 shadow-none' : isOpen ? 'border-brand-600' : 'border-line/70',
              )}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => !removed && setOpen(isOpen ? null : slot.id)}
                  disabled={removed}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ProductImage
                    product={product}
                    className={cn('h-14 w-14 transition', removed && 'opacity-40 grayscale')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">{slot.title}</span>
                    <span
                      className={cn(
                        'block truncate text-[13.5px] font-semibold',
                        removed ? 'text-muted line-through' : 'text-navy',
                      )}
                    >
                      {styleOf(product)}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px]">
                      <span className={cn('font-bold', removed ? 'text-muted line-through' : 'text-navy')}>
                        {rub(product.price)}
                      </span>
                      {!removed && idx >= 3 && (
                        <span className="rounded bg-accent-soft px-1.5 text-[10.5px] font-bold text-accent-dark">
                          +{rub(round2(product.price - getProduct(slot.variants[0]).price))}
                        </span>
                      )}
                      {removed && <span className="text-muted">убрано из пакета</span>}
                    </span>
                  </span>
                  {!removed && (
                    <ChevronDown
                      size={18}
                      className={cn('shrink-0 text-muted transition-transform duration-200', isOpen && 'rotate-180')}
                    />
                  )}
                </button>
                {removed ? (
                  <Tap
                    onClick={() => restore(slot.id)}
                    className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-brand-600/40 px-2.5 text-[12px] font-bold text-brand-600 active:bg-brand-50"
                  >
                    <RotateCcw size={14} /> Вернуть
                  </Tap>
                ) : (
                  <Tap
                    onClick={() => remove(slot.id)}
                    aria-label={`Убрать: ${slot.title}`}
                    aria-disabled={!canRemove}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      canRemove ? 'text-muted active:bg-red-50 active:text-price' : 'text-line',
                    )}
                  >
                    <Trash2 size={17} />
                  </Tap>
                )}
              </div>

              {/* 5 вариантов */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-clip"
                  >
                    <div className="border-t border-line px-3 pt-2.5 pb-3">
                      <p className="mb-2 text-[11.5px] text-muted">Выберите вариант — 3 без доплаты, 2 премиум</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {slot.variants.map((pid, i) => {
                          const p = getProduct(pid)
                          const sel = i === idx
                          const delta = round2(p.price - getProduct(slot.variants[0]).price)
                          return (
                            <button
                              key={pid}
                              onClick={() => pick(slot.id, i)}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg border-2 px-2.5 py-2 text-left transition-colors',
                                sel ? 'border-brand-600 bg-brand-50/60' : 'border-line bg-white active:bg-panel',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2',
                                  sel ? 'border-brand-600 bg-brand-600' : 'border-line',
                                )}
                              >
                                {sel && <Check size={12} className="text-white" strokeWidth={3.5} />}
                              </span>
                              <ProductImage product={p} size={16} className="h-10 w-10" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold text-navy">{styleOf(p)}</span>
                                <span className="block truncate text-[11px] text-muted">
                                  {p.specs.find((s) => s.name === 'Материал')?.value} · {p.brand}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 text-[12px] font-bold whitespace-nowrap',
                                  delta > 0 ? 'text-accent-dark' : 'text-emerald-600',
                                )}
                              >
                                {delta > 0 ? `+${rub(delta)}` : 'без доплаты'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <Link
                        to={`/product/${slot.variants[idx]}`}
                        className="mt-2 inline-block text-[12px] font-semibold text-brand-600"
                      >
                        Карточка товара в каталоге →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>

      {/* Итог — прилипает над меню */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[92px] z-30 mx-auto max-w-[430px] px-3">
        <div className="pointer-events-auto rounded-2xl border border-line bg-white/95 p-3 shadow-lift backdrop-blur">
          <div className="mb-2 flex items-end justify-between gap-2 px-1">
            <span className="text-[12px] leading-tight text-muted">
              <b className="text-navy">
                {kept} из {n}
              </b>{' '}
              позиций
              {extra > 0 && <span className="block text-accent-dark">премиум-варианты +{rub(extra)}</span>}
              {kept < n && <span className="block">убрано: −{rub(round2(base + extra - total))}</span>}
            </span>
            <motion.span
              key={total}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[20px] leading-none font-black text-navy tabular-nums"
            >
              {rub(total)}
            </motion.span>
          </div>
          {added ? (
            <div className="flex gap-2">
              <Tap
                onClick={() => {
                  setChoice({})
                  setAdded(false)
                }}
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-brand-600/40 text-[13.5px] font-bold text-brand-600 active:bg-brand-50"
              >
                Собрать ещё
              </Tap>
              <Tap
                onClick={() => navigate('/cart')}
                className="flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-[14px] font-bold text-white"
              >
                <PackageCheck size={17} /> В корзине <ArrowRight size={15} />
              </Tap>
            </div>
          ) : (
            <Tap
              onClick={toCart}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-brand-600 text-[14.5px] font-bold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)] active:bg-brand-700"
            >
              Добавить пакет в корзину
            </Tap>
          )}
        </div>
      </div>
    </div>
  )
}

/** «Коврик для ванной «Мох», серый» → «Мох, серый» */
function styleOf(p) {
  const m = p.name.match(/«(.+?)»,\s*(.+)$/)
  return m ? `«${m[1]}», ${m[2]}` : p.name
}
