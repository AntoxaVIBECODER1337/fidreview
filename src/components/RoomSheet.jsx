import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calculator, Check, ChevronDown, Minus, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
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
 * Карточка комнаты. По умолчанию — просмотр: параметры и товары, использованные
 * в ремонте. Кнопки «Изменить» у каждого блока включают редактирование —
 * параметры как раньше (инпуты), товары — с поиском из каталога и моих заказов.
 * Новая комната открывается сразу в режиме редактирования.
 */
export default function RoomSheet({ room, floorId, onClose, editInitial = false }) {
  const navigate = useNavigate()
  const { layout, saveRoom, removeRoom, orders } = useStore()
  const isNew = !room?.id
  const [editParams, setEditParams] = useState(isNew || editInitial)
  const [editItems, setEditItems] = useState(isNew || editInitial)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
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

  /** Выбор типа из списка: подставляем название, если оно пустое или совпадало со старым типом */
  const pickType = (id) => {
    const prev = d.type ? roomType(d.type).label : ''
    const label = roomType(id).label
    set({ type: id, name: !d.name.trim() || d.name === prev ? label : d.name })
    setTypeOpen(false)
  }

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
      <div className="pb-2">
        {/* Параметры */}
        <Section
          title="Параметры"
          editing={editParams}
          onToggle={() => setEditParams((v) => !v)}
        >
          {editParams ? (
            <div className="flex flex-col gap-4">
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
                <button
                  onClick={() => setTypeOpen(true)}
                  className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 text-left transition-colors active:bg-panel"
                >
                  {d.type ? (
                    <>
                      {(() => {
                        const T = roomType(d.type).Icon
                        return <T size={18} strokeWidth={1.9} className="shrink-0 text-brand-600" />
                      })()}
                      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-navy">
                        {roomType(d.type).label}
                      </span>
                    </>
                  ) : (
                    <span className="min-w-0 flex-1 text-[14px] text-muted">Выберите тип комнаты</span>
                  )}
                  <ChevronDown size={17} className="shrink-0 text-muted" />
                </button>
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
            </div>
          ) : (
            <ParamsView d={d} layout={layout} auto={auto} per={per} wa={wa} />
          )}
        </Section>

        {/* Товары */}
        <Section
          title={`Товары${d.items.length ? ` · ${d.items.length}` : ''}`}
          editing={editItems}
          onToggle={() => setEditItems((v) => !v)}
        >
          {editItems ? (
            <RoomItems items={d.items} orders={orders} onChange={(items) => set({ items })} total={itemsTotal} />
          ) : (
            <ItemsView items={d.items} total={itemsTotal} />
          )}
        </Section>

        {/* Выбор типа комнаты — выпадающий список с поиском */}
        <AnimatePresence>
          {typeOpen && <TypeSheet types={types} value={d.type} onPick={pickType} onClose={() => setTypeOpen(false)} />}
        </AnimatePresence>
      </div>
    </Sheet>
  )
}

/** Выбор типа комнаты — компактная шторка со списком и поиском */
function TypeSheet({ types, value, onPick, onClose }) {
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()
  const list = t ? types.filter((x) => x.label.toLowerCase().includes(t)) : types
  return (
    <Sheet
      title="Тип комнаты"
      subtitle={t ? `Найдено: ${list.length}` : 'Выберите из списка или введите название'}
      onClose={onClose}
      maxH="70dvh"
    >
      <div className="sticky top-0 -mx-4 bg-white px-4 pb-2">
        <div className="flex h-11 items-center gap-2 rounded-xl bg-panel px-3">
          <Search size={17} className="shrink-0 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: спальня, балкон…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-navy placeholder:text-muted"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Очистить">
              <X size={16} className="text-muted" />
            </button>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-1 pt-1 pb-2">
        {list.map((x) => {
          const active = x.id === value
          return (
            <li key={x.id}>
              <button
                onClick={() => onPick(x.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors',
                  active ? 'border-brand-600 bg-brand-50/60' : 'border-transparent active:bg-panel',
                )}
              >
                <x.Icon size={19} strokeWidth={1.9} className={active ? 'shrink-0 text-brand-600' : 'shrink-0 text-muted'} />
                <span className="min-w-0 flex-1 text-[14px] font-bold text-navy">{x.label}</span>
                {active && <Check size={17} className="shrink-0 text-brand-600" strokeWidth={3} />}
              </button>
            </li>
          )
        })}
        {list.length === 0 && (
          <li className="px-2 py-6 text-center text-[13px] text-muted">Ничего не нашлось — попробуйте другое слово</li>
        )}
      </ul>
    </Sheet>
  )
}

/** Заголовок блока с кнопкой «Изменить» / «Готово» */
function Section({ title, editing, onToggle, children }) {
  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[14px] font-extrabold text-navy">{title}</h3>
        <button
          onClick={onToggle}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-bold text-navy transition-colors active:bg-panel"
        >
          {editing ? (
            <>
              <Check size={13} className="text-brand-600" /> Готово
            </>
          ) : (
            <>
              <Pencil size={13} /> Изменить
            </>
          )}
        </button>
      </div>
      {children}
    </section>
  )
}

/** Параметры комнаты — просмотр */
function ParamsView({ d, layout, auto, per, wa }) {
  const area = toNum(d.area) || auto
  const floor = layout.floors.find((f) => f.id === d.floorId)
  const walls = (d.walls ?? []).map((w) => toNum(w)).filter((w) => w > 0)
  const status = ROOM_STATUSES.find((s) => s.id === d.status)
  const t = roomType(d.type)
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-panel p-2.5 text-center">
        <Metric value={area ? `${area} м²` : '—'} label="площадь" />
        <Metric value={toNum(d.height) ? `${toNum(d.height)} м` : '—'} label="высота" />
        <Metric value={per ? `${per} м` : '—'} label="периметр" />
        <Metric value={wa ? `${wa} м²` : '—'} label="площадь стен" />
      </div>
      <Row label="Тип" value={t.label} />
      {layout.floors.length > 1 && floor && <Row label="Этаж" value={floor.name} />}
      {walls.length > 0 && (
        <Row label="Стены" value={walls.map((w, i) => `${WALL_NAMES[i] ?? i + 1} — ${w} м`).join(' · ')} />
      )}
      {status && <Row label="Состояние" value={status.label} />}
      {d.note?.trim() && <Row label="Заметка" value={d.note} />}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
      <span className="shrink-0 text-[12px] font-bold text-muted">{label}</span>
      <span className="text-right text-[13px] font-semibold text-navy">{value}</span>
    </div>
  )
}

/** Товары комнаты — просмотр */
function ItemsView({ items, total }) {
  const rows = items.map((i) => ({ p: getProduct(i.id), qty: i.qty })).filter((r) => r.p)
  if (!rows.length)
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-[12.5px] text-muted">
        Пока ничего не добавлено. Нажмите «Изменить» — добавьте материалы из каталога или из ваших заказов
      </p>
    )
  return (
    <div>
      <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
        {rows.map(({ p, qty }) => (
          <li key={p.id} className="flex items-center gap-2.5 px-2.5 py-2">
            <ProductImage product={p} size={18} className="h-10 w-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-semibold text-navy">{p.name}</span>
              <span className="block text-[11px] text-muted">
                {rub(p.price)} / {p.unit}
              </span>
            </span>
            <span className="shrink-0 text-[12.5px] font-bold text-navy tabular-nums">×{qty}</span>
            <span className="w-[70px] shrink-0 text-right text-[12px] font-semibold text-muted">
              {rub(Math.round(p.price * qty * 100) / 100)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-baseline justify-between px-1">
        <span className="text-[12.5px] font-bold text-navy">Итого материалы</span>
        <span className="text-[13px] font-black text-navy">{rub(Math.round(total * 100) / 100)}</span>
      </div>
    </div>
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
      <div className="text-[13px] font-black text-navy tabular-nums">{value}</div>
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
