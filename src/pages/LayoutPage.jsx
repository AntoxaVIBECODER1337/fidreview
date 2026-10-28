import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Building, ChevronRight, House, LayoutPanelLeft, Pencil, Plus, Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FloorPlan from '../components/FloorPlan.jsx'
import RoomSheet from '../components/RoomSheet.jsx'
import Sheet from '../components/Sheet.jsx'
import { PrimaryButton, Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { DWELLINGS, roomArea, roomType, statusLabel } from '../data/rooms'
import { getProduct } from '../lib/catalog'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'

const STATUS_CHIP = {
  free: 'bg-panel text-muted',
  rough: 'bg-amber-50 text-amber-700',
  work: 'bg-brand-50 text-brand-700',
  done: 'bg-emerald-50 text-emerald-700',
}

const r1 = (n) => Math.round(n * 10) / 10

/** «Моя планировка»: этажи, схема комнат, список комнат */
export default function LayoutPage() {
  const navigate = useNavigate()
  const { layout, startLayout, addFloor, removeFloor } = useStore()
  const [floorId, setFloorId] = useState(layout?.floors[0]?.id)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null) // { room } | { new: true }
  const [editPlan, setEditPlan] = useState(false)

  if (!layout) return <Start onStart={startLayout} onBack={() => navigate('/my-home')} />

  const floor = layout.floors.find((f) => f.id === floorId) ?? layout.floors[0]
  const rooms = layout.rooms.filter((r) => r.floorId === floor.id)
  const totalArea = r1(layout.rooms.reduce((s, r) => s + roomArea(r), 0))
  const floorArea = r1(rooms.reduce((s, r) => s + roomArea(r), 0))
  const living = layout.rooms.filter((r) => ['living', 'bedroom', 'kids', 'study', 'kitchen-living'].includes(r.type)).length
  const anyWork = layout.rooms.some((r) => r.status === 'work')

  const selectRoom = (id) => {
    if (selected === id) setEditing({ room: layout.rooms.find((r) => r.id === id) })
    else setSelected(id)
  }

  const newFloor = () => {
    const id = addFloor()
    setFloorId(id)
    setSelected(null)
  }

  return (
    <div className="min-h-dvh bg-bg pb-8">
      {/* Шапка */}
      <header className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <Tap
            onClick={() => navigate('/my-home')}
            aria-label="Назад"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-navy active:bg-white"
          >
            <ArrowLeft size={21} strokeWidth={2.3} />
          </Tap>
          <h1 className="text-[24px] font-black tracking-tight text-navy">Моя планировка</h1>
        </div>
        <p className="mt-1 px-1 text-[13.5px] leading-snug text-[#3f4756]">
          Добавляйте этажи и комнаты, указывайте размеры и товары, которые использовали в ремонте
        </p>
      </header>

      <motion.div variants={staggerParent} initial="hidden" animate="show" className="flex flex-col gap-4 px-4 pt-4">
        {/* План */}
        <motion.section variants={staggerChild} className="rounded-2xl border border-line/70 bg-white p-3.5 shadow-soft">
          <div className="flex items-start gap-2.5 px-0.5">
            <LayoutPanelLeft size={20} className="mt-0.5 shrink-0 text-brand-600" />
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] leading-tight font-extrabold text-navy">
                {layout.name} <span className="whitespace-nowrap">· {totalArea} м²</span>
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {DWELLINGS.find((d) => d.id === layout.dwelling)?.label} · {layout.rooms.length}{' '}
                {plural(layout.rooms.length, ['комната', 'комнаты', 'комнат'])}
                {living ? ` · жилых ${living}` : ''}
                {layout.floors.length > 1 ? ` · ${layout.floors.length} этажа` : ''}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold',
                anyWork ? 'bg-brand-50 text-brand-700' : 'bg-panel text-muted',
              )}
            >
              {anyWork ? 'Идёт ремонт' : 'Активна'}
            </span>
          </div>

          {/* Этажи */}
          <div className="no-scrollbar -mx-3.5 mt-3 flex gap-1.5 overflow-x-auto px-3.5">
            {layout.floors.map((f) => {
              const active = f.id === floor.id
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFloorId(f.id)
                    setSelected(null)
                  }}
                  className={cn(
                    'relative h-8 shrink-0 rounded-full px-3.5 text-[12.5px] font-bold transition-colors',
                    active ? 'text-white' : 'bg-panel text-muted',
                  )}
                >
                  {active && (
                    <motion.span layoutId="floor-pill" className="absolute inset-0 rounded-full bg-navy" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />
                  )}
                  <span className="relative z-10">{f.name}</span>
                </button>
              )
            })}
            <button
              onClick={newFloor}
              className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-dashed border-brand-600/50 px-3 text-[12.5px] font-bold text-brand-600"
            >
              <Plus size={14} /> Этаж
            </button>
          </div>

          <div className="mt-3">
            {rooms.length ? (
              <FloorPlan rooms={rooms} selectedId={selected} onSelect={selectRoom} height={rooms.length > 4 ? 320 : 260} />
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-panel/60 px-6 text-center">
                <p className="text-[13.5px] font-bold text-navy">На этаже «{floor.name}» пока нет комнат</p>
                <p className="text-[12px] text-muted">Добавьте первую — укажите тип и размеры</p>
                {layout.floors.length > 1 && (
                  <button onClick={() => removeFloor(floor.id)} className="mt-1 text-[12px] font-bold text-muted underline">
                    Удалить этаж
                  </button>
                )}
              </div>
            )}
          </div>
          {rooms.length > 0 && (
            <p className="mt-2 px-1 text-[11.5px] text-muted">
              {floor.name}: {floorArea} м² · нажмите на комнату, повторно — откроются настройки
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <PrimaryButton className="flex-1" onClick={() => setEditing({ new: true })}>
              <span className="flex items-center justify-center gap-1.5">
                <Plus size={18} /> Добавить комнату
              </span>
            </PrimaryButton>
            <Tap
              onClick={() => setEditPlan(true)}
              className="flex h-12 items-center gap-1.5 rounded-lg bg-brand-50 px-4 text-[14px] font-bold text-brand-700 active:bg-brand-100"
            >
              <Pencil size={16} /> Изменить
            </Tap>
          </div>
        </motion.section>

        {/* Комнаты этажа */}
        <motion.section variants={staggerChild}>
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <h2 className="text-[18px] font-extrabold text-navy">Мои комнаты</h2>
            <span className="rounded-full bg-panel px-2.5 py-0.5 text-[11.5px] font-bold text-muted">
              {rooms.length} {plural(rooms.length, ['комната', 'комнаты', 'комнат'])}
            </span>
            {layout.floors.length > 1 && <span className="ml-auto text-[12px] text-muted">{floor.name}</span>}
          </div>
          <div className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {rooms.map((r) => (
                <RoomRow
                  key={r.id}
                  room={r}
                  selected={r.id === selected}
                  onSelect={() => setSelected(r.id)}
                  onEdit={() => setEditing({ room: r })}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {editing && (
          <RoomSheet
            key={editing.room?.id ?? 'new'}
            room={editing.room}
            floorId={floor.id}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{editPlan && <PlanSheet onClose={() => setEditPlan(false)} />}</AnimatePresence>
    </div>
  )
}

function RoomRow({ room, selected, onSelect, onEdit }) {
  const t = roomType(room.type)
  const area = roomArea(room)
  const names = (room.items ?? [])
    .map((i) => getProduct(i.id)?.name.split(/[\s«(,]/)[0])
    .filter(Boolean)
  const summary = [...new Set(names)].slice(0, 3).join(', ')
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-soft transition-colors',
        selected ? 'border-brand-600' : 'border-line/70',
      )}
    >
      <button onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <t.Icon size={22} strokeWidth={1.9} className="text-brand-600" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-extrabold text-navy">
              {room.name}
              {area ? <span className="font-semibold text-muted"> · {area} м²</span> : null}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold', STATUS_CHIP[room.status])}>
              {room.status === 'done' ? '✓ ' : ''}
              {statusLabel(room.status)}
            </span>
            <span className="truncate text-[12px] text-muted">{summary || t.label}</span>
          </span>
        </span>
      </button>
      <Tap
        onClick={onEdit}
        className="shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-[12.5px] font-bold text-brand-700 active:bg-brand-100"
      >
        Настроить
      </Tap>
    </motion.div>
  )
}

/** Первый вход: пример или своя планировка */
function Start({ onStart, onBack }) {
  return (
    <div className="min-h-dvh bg-bg px-4 pt-3 pb-8">
      <div className="flex items-center gap-2">
        <Tap onClick={onBack} aria-label="Назад" className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-navy">
          <ArrowLeft size={21} strokeWidth={2.3} />
        </Tap>
        <h1 className="text-[24px] font-black tracking-tight text-navy">Моя планировка</h1>
      </div>
      <p className="mt-1 px-1 text-[13.5px] leading-snug text-[#3f4756]">
        Соберите свою квартиру или дом: комнаты, размеры стен, материалы, которые использовали. ИИ и бригады
        будут учитывать планировку.
      </p>

      <motion.div variants={staggerParent} initial="hidden" animate="show" className="mt-5 flex flex-col gap-3">
        {[
          { kind: 'apartment', Icon: Building, title: 'Квартира', desc: 'Один или несколько уровней' },
          { kind: 'house', Icon: House, title: 'Дом', desc: 'Этажи, мансарда, котельная, гараж, участок' },
        ].map((o) => (
          <motion.div key={o.kind} variants={staggerChild}>
            <Tap
              onClick={() => onStart(o.kind)}
              className="flex w-full items-center gap-3 rounded-2xl border border-line/70 bg-white p-4 text-left shadow-soft"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <o.Icon size={24} className="text-brand-600" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-extrabold text-navy">Создать: {o.title.toLowerCase()}</span>
                <span className="block text-[12.5px] text-muted">{o.desc}</span>
              </span>
              <ChevronRight size={18} className="text-muted" />
            </Tap>
          </motion.div>
        ))}
        <motion.div variants={staggerChild}>
          <Tap
            onClick={() => onStart('demo')}
            className="flex w-full items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#1d5dbe_0%,#174c9d_100%)] p-4 text-left text-white shadow-[0_8px_24px_rgb(29_93_190/0.3)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Sparkles size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-extrabold">Открыть пример</span>
              <span className="block text-[12.5px] text-white/80">2-комн. квартира 64 м², 6 помещений с товарами</span>
            </span>
            <ChevronRight size={18} />
          </Tap>
        </motion.div>
      </motion.div>
    </div>
  )
}

/** Изменить план: название, квартира/дом, этажи */
function PlanSheet({ onClose }) {
  const { layout, updateLayout, renameFloor, removeFloor, addFloor, resetLayout } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  return (
    <Sheet title="Планировка" subtitle="Название, тип жилья и этажи" onClose={onClose} maxH="85dvh">
      <div className="flex flex-col gap-4 pt-1 pb-2">
        <div>
          <p className="mb-1.5 px-1 text-[12.5px] font-bold text-navy">Название</p>
          <input
            id="plan-name"
            value={layout.name}
            onChange={(e) => updateLayout({ name: e.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-navy focus:border-brand-500"
          />
        </div>
        <div>
          <p className="mb-1.5 px-1 text-[12.5px] font-bold text-navy">Тип жилья</p>
          <div className="flex rounded-xl bg-panel p-1">
            {DWELLINGS.map((d) => (
              <button
                key={d.id}
                onClick={() => updateLayout({ dwelling: d.id })}
                className={cn(
                  'flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors',
                  layout.dwelling === d.id ? 'bg-white text-brand-700 shadow-soft' : 'text-muted',
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 px-1 text-[11.5px] text-muted">У дома больше типов комнат: мансарда, котельная, гараж, терраса…</p>
        </div>
        <div>
          <p className="mb-1.5 px-1 text-[12.5px] font-bold text-navy">Этажи</p>
          <div className="flex flex-col gap-1.5">
            {layout.floors.map((f) => {
              const n = layout.rooms.filter((r) => r.floorId === f.id).length
              return (
                <div key={f.id} className="flex items-center gap-2">
                  <input
                    id={`floor-${f.id}`}
                    value={f.name}
                    onChange={(e) => renameFloor(f.id, e.target.value)}
                    className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-[13.5px] text-navy focus:border-brand-500"
                  />
                  <span className="w-20 shrink-0 text-right text-[11.5px] text-muted">
                    {n} {plural(n, ['комната', 'комнаты', 'комнат'])}
                  </span>
                  {layout.floors.length > 1 && (
                    <button
                      onClick={() => removeFloor(f.id)}
                      aria-label={`Удалить ${f.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted active:bg-panel"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )
            })}
            <button onClick={addFloor} className="mt-1 flex w-fit items-center gap-1 text-[12.5px] font-bold text-brand-600">
              <Plus size={14} /> Добавить этаж
            </button>
          </div>
        </div>
        <button
          onClick={() => (confirmReset ? (resetLayout(), onClose()) : setConfirmReset(true))}
          className={cn(
            'mt-2 h-11 rounded-lg border text-[13px] font-bold',
            confirmReset ? 'border-price bg-price text-white' : 'border-line text-muted',
          )}
        >
          {confirmReset ? 'Точно удалить всю планировку?' : 'Удалить планировку'}
        </button>
      </div>
    </Sheet>
  )
}

function plural(n, f) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return f[2]
  if (b > 1 && b < 5) return f[1]
  if (b === 1) return f[0]
  return f[2]
}
