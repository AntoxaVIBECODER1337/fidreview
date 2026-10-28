import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calculator, Minus, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ROOM_STATUSES,
  areaFromWalls,
  perimeter,
  roomType,
  roomTypesFor,
  toNum,
  wallArea,
} from '../data/rooms'
import { getProduct, products } from '../lib/catalog'
import { cn } from '../lib/cn'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import ProductImage from './ProductImage.jsx'
import Sheet from './Sheet.jsx'
import { PrimaryButton, Tap } from './ui.jsx'

const WALL_NAMES = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З']

/**
 * Создание и настройка комнаты: параметры (название, тип, этаж, площадь,
 * высота, стены, статус) и товары из каталога, использованные в ремонте.
 */
export default function RoomSheet({ room, floorId, onClose }) {
  const navigate = useNavigate()
  const { layout, saveRoom, removeRoom, orders } = useStore()
  const isNew = !room?.id
  const [tab, setTab] = useState('params')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [d, setD] = useState(() =>
    room?.id
      ? {
          ...room,
          area: room.area ? String(room.area) : '',
          height: String(room.height || '2.7'),
          walls: (room.walls?.length ? room.walls : [0, 0, 0, 0]).map((w) => (w ? String(w) : '')),
          items: [...(room.items ?? [])],
        }
      : { name: '', type: '', floorId, area: '', height: '2.7', walls: ['', '', '', ''], status: 'free', items: [], note: '' },
  )
  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const types = roomTypesFor(layout.dwelling)

  const auto = areaFromWalls(d.walls)
  const per = perimeter(d)
  const wa = wallArea(d)
  const valid = d.name.trim() && d.type
  const itemsTotal = d.items.reduce((s, i) => s + (getProduct(i.id)?.price ?? 0) * i.qty, 0)

  const save = () => {
    if (!valid) return
    saveRoom({
      ...d,
      name: d.name.trim(),
      area: toNum(d.area) || auto || 0,
      height: toNum(d.height) || 2.7,
      walls: d.walls.map((w) => toNum(w)),
    })
    onClose()
  }

  const repairWithAI = () => {
    const t = roomType(d.type)
    const area = toNum(d.area) || auto
    const named = d.name.trim() && d.name.trim() !== t.label ? ` «${d.name.trim()}»` : ''
    navigate('/my-home', { state: { task: `Ремонт: ${t.label.toLowerCase()}${named}${area ? `, ${area} м²` : ''}` } })
    onClose()
  }

  const footer = (
    <div className="flex gap-2">
      {!isNew && (
        <Tap
          onClick={() => (confirmDelete ? (removeRoom(room.id), onClose()) : setConfirmDelete(true))}
          aria-label="Удалить комнату"
          className={cn(
            'flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-[13px] font-bold transition-colors',
            confirmDelete ? 'border-price bg-price text-white' : 'border-line text-muted',
          )}
        >
          <Trash2 size={16} />
          {confirmDelete && 'Удалить?'}
        </Tap>
      )}
      <PrimaryButton className="flex-1" onClick={save} disabled={!valid}>
        {isNew ? 'Добавить комнату' : 'Сохранить'}
      </PrimaryButton>
    </div>
  )

  return (
    <Sheet
      title={isNew ? 'Новая комната' : d.name || 'Комната'}
      subtitle={
        isNew
          ? 'Название, тип и размеры — товары можно добавить сразу или позже'
          : `${roomType(d.type).label}${toNum(d.area) || auto ? ` · ${toNum(d.area) || auto} м²` : ''}`
      }
      onClose={onClose}
      footer={footer}
      maxH="92dvh"
    >
      {/* Вкладки */}
      <div className="sticky top-0 z-10 -mx-4 bg-white px-4 pt-1 pb-3">
        <div className="flex rounded-xl bg-panel p-1">
          {[
            ['params', 'Параметры'],
            ['items', `Товары${d.items.length ? ` · ${d.items.length}` : ''}`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn('relative flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors', tab === id ? 'text-white' : 'text-muted')}
            >
              {tab === id && (
                <motion.span layoutId="room-tab" className="absolute inset-0 rounded-lg bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'params' ? (
          <motion.div key="p" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-4 pb-2">
            <Field label="Название">
              <input
                id="room-name"
                value={d.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder={d.type ? roomType(d.type).label : 'Например, «Детская Маши»'}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-navy placeholder:text-muted focus:border-brand-500"
              />
            </Field>

            <Field label={`Тип комнаты${layout.dwelling === 'house' ? ' · дом' : ' · квартира'}`}>
              <div className="grid grid-cols-3 gap-1.5">
                {types.map((t) => {
                  const active = d.type === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        const prev = d.type ? roomType(d.type).label : ''
                        set({ type: t.id, name: !d.name.trim() || d.name === prev ? t.label : d.name })
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-2 text-center transition-colors',
                        active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line bg-white text-navy',
                      )}
                    >
                      <t.Icon size={18} strokeWidth={1.9} className={active ? 'text-brand-600' : 'text-muted'} />
                      <span className="text-[11px] leading-tight font-semibold">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </Field>

            {layout.floors.length > 1 && (
              <Field label="Этаж">
                <div className="flex flex-wrap gap-1.5">
                  {layout.floors.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => set({ floorId: f.id })}
                      className={cn(
                        'h-9 rounded-full border px-3.5 text-[12.5px] font-semibold',
                        d.floorId === f.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-navy',
                      )}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Стены, м">
              <div className="grid grid-cols-4 gap-1.5">
                {d.walls.map((w, i) => (
                  <label key={i} className="relative">
                    <span className="pointer-events-none absolute top-1.5 left-2 text-[10px] font-bold text-muted">
                      {WALL_NAMES[i] ?? i + 1}
                    </span>
                    <input
                      id={`room-wall-${i}`}
                      value={w}
                      inputMode="decimal"
                      onChange={(e) => set({ walls: d.walls.map((x, k) => (k === i ? e.target.value : x)) })}
                      placeholder="0"
                      className="h-12 w-full rounded-xl border border-line bg-white px-2 pt-3 text-center text-[14px] font-semibold text-navy tabular-nums focus:border-brand-500"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {d.walls.length < 8 && (
                  <button onClick={() => set({ walls: [...d.walls, ''] })} className="flex items-center gap-1 text-[12px] font-bold text-brand-600">
                    <Plus size={14} /> Стена
                  </button>
                )}
                {d.walls.length > 2 && (
                  <button onClick={() => set({ walls: d.walls.slice(0, -1) })} className="flex items-center gap-1 text-[12px] font-bold text-muted">
                    <Minus size={14} /> Убрать
                  </button>
                )}
                <span className="ml-auto text-[11.5px] text-muted">для Г-образных — до 8 стен</span>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Площадь, м²">
                <input
                  id="room-area"
                  value={d.area}
                  inputMode="decimal"
                  onChange={(e) => set({ area: e.target.value })}
                  placeholder={auto ? String(auto) : '0'}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] font-semibold text-navy tabular-nums placeholder:text-muted focus:border-brand-500"
                />
                {auto > 0 && String(auto) !== String(d.area) && (
                  <button onClick={() => set({ area: String(auto) })} className="mt-1.5 flex items-center gap-1 text-[11.5px] font-bold text-brand-600">
                    <Calculator size={12} /> По стенам: {auto} м²
                  </button>
                )}
              </Field>
              <Field label="Высота потолка, м">
                <input
                  id="room-height"
                  value={d.height}
                  inputMode="decimal"
                  onChange={(e) => set({ height: e.target.value })}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] font-semibold text-navy tabular-nums focus:border-brand-500"
                />
              </Field>
            </div>

            {(per > 0 || wa > 0) && (
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-panel p-2.5 text-center">
                <Metric value={per ? `${per} м` : '—'} label="периметр" />
                <Metric value={wa ? `${wa} м²` : '—'} label="площадь стен" />
                <Metric value={toNum(d.area) || auto ? `${toNum(d.area) || auto} м²` : '—'} label="пол / потолок" />
              </div>
            )}

            <Field label="Состояние">
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-panel p-1">
                {ROOM_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set({ status: s.id })}
                    className={cn(
                      'rounded-lg py-2 text-[11.5px] font-bold transition-colors',
                      d.status === s.id ? 'bg-white text-brand-700 shadow-soft' : 'text-muted',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Заметка">
              <textarea
                id="room-note"
                value={d.note}
                onChange={(e) => set({ note: e.target.value })}
                rows={2}
                placeholder="Например: тёплый пол, розетки у окна"
                className="w-full resize-none rounded-xl border border-line bg-white p-3 text-[13.5px] text-navy placeholder:text-muted focus:border-brand-500"
              />
            </Field>

            {d.type && (
              <Tap
                onClick={repairWithAI}
                className="flex items-center gap-2.5 rounded-xl border border-brand-600/25 bg-brand-50 p-3 text-left"
              >
                <Sparkles size={18} className="shrink-0 text-brand-600" />
                <span className="text-[12.5px] leading-snug text-navy">
                  <b>Ремонт этой комнаты с ИИ</b> — подставим тип и площадь в задачу
                </span>
              </Tap>
            )}
          </motion.div>
        ) : (
          <motion.div key="i" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="pb-2">
            <RoomItems
              items={d.items}
              orders={orders}
              onChange={(items) => set({ items })}
              total={itemsTotal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-[12.5px] font-bold text-navy">{label}</p>
      {children}
    </div>
  )
}

function Metric({ value, label }) {
  return (
    <div>
      <div className="text-[14px] font-black text-navy tabular-nums">{value}</div>
      <div className="text-[10.5px] text-muted">{label}</div>
    </div>
  )
}

/** Товары комнаты + поиск по каталогу и по моим заказам */
function RoomItems({ items, orders, onChange, total }) {
  const [q, setQ] = useState('')
  const [source, setSource] = useState('catalog')
  const ordered = useMemo(() => [...new Set(orders.flatMap((o) => o.items.map((i) => i.id)))], [orders])

  const results = useMemo(() => {
    const base = source === 'orders' ? ordered.map(getProduct).filter(Boolean) : products
    const t = q.trim().toLowerCase()
    const list = t ? base.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)) : base
    return list.slice(0, t ? 30 : 12)
  }, [q, source, ordered])

  const add = (id) => {
    const has = items.find((i) => i.id === id)
    onChange(has ? items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) : [...items, { id, qty: 1 }])
  }
  const setQty = (id, qty) => onChange(qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty } : i)))

  return (
    <div className="flex flex-col gap-4">
      {/* В комнате */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between px-1">
          <p className="text-[12.5px] font-bold text-navy">Использовано в ремонте</p>
          {items.length > 0 && <span className="text-[12.5px] font-black text-navy">{rub(Math.round(total * 100) / 100)}</span>}
        </div>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-[12.5px] text-muted">
            Добавьте материалы и мебель, которые купили для этой комнаты — пригодится для гарантии и повторных покупок
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
            <AnimatePresence initial={false}>
              {items.map((i) => {
                const p = getProduct(i.id)
                if (!p) return null
                return (
                  <motion.li
                    key={i.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 overflow-hidden px-2.5 py-2"
                  >
                    <ProductImage product={p} size={18} className="h-10 w-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-navy">{p.name}</span>
                      <span className="block text-[11px] text-muted">
                        {rub(p.price)} / {p.unit}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center rounded-lg border border-line">
                      <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Меньше" className="flex h-7 w-7 items-center justify-center text-muted">
                        {i.qty === 1 ? <X size={13} /> : <Minus size={13} />}
                      </button>
                      <span className="w-6 text-center text-[12.5px] font-bold text-navy tabular-nums">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Больше" className="flex h-7 w-7 items-center justify-center text-muted">
                        <Plus size={13} />
                      </button>
                    </span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Добавить */}
      <div>
        <p className="mb-1.5 px-1 text-[12.5px] font-bold text-navy">Добавить из каталога</p>
        <div className="flex h-11 items-center gap-2 rounded-xl bg-panel px-3">
          <Search size={17} className="shrink-0 text-muted" />
          <input
            id="room-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ламинат, смеситель, плитка…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-navy placeholder:text-muted"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Очистить">
              <X size={16} className="text-muted" />
            </button>
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          {[
            ['catalog', 'Весь каталог'],
            ['orders', `Мои заказы${ordered.length ? ` · ${ordered.length}` : ''}`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSource(id)}
              className={cn('h-8 rounded-lg px-3 text-[12px] font-semibold', source === id ? 'bg-navy text-white' : 'bg-panel text-muted')}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="mt-2 flex flex-col">
          {results.map((p) => {
            const inRoom = items.find((i) => i.id === p.id)
            return (
              <li key={p.id}>
                <button onClick={() => add(p.id)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left active:bg-panel">
                  <ProductImage product={p} size={16} className="h-10 w-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-navy">{p.name}</span>
                    <span className="block text-[11px] text-muted">{rub(p.price)}</span>
                  </span>
                  <span
                    className={cn(
                      'flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[11.5px] font-bold',
                      inRoom ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700',
                    )}
                  >
                    <Plus size={13} /> {inRoom ? inRoom.qty : 'В комнату'}
                  </span>
                </button>
              </li>
            )
          })}
          {results.length === 0 && (
            <li className="px-2 py-4 text-center text-[12.5px] text-muted">
              {source === 'orders' ? 'Заказов пока нет — найдите товар во всём каталоге' : 'Ничего не нашлось'}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
