import { motion } from 'framer-motion'
import { roomArea, roomType, statusLabel } from '../data/rooms'
import { cn } from '../lib/cn'
import { squarify } from '../lib/treemap'

/** Стиль плитки по статусу комнаты */
const TONE = {
  work: 'bg-brand-600 text-white',
  done: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200',
  rough: 'bg-white text-navy',
  free: 'bg-white text-navy',
}
const SUB = {
  work: 'text-white/80',
  done: 'text-emerald-700',
  rough: 'text-muted',
  free: 'text-muted',
}

/**
 * Схема этажа: плитки комнат, размер ∝ площади.
 * Комната в работе — синяя, готовая — зелёная, выбранная — с обводкой.
 */
export default function FloorPlan({ rooms, selectedId, onSelect, height = 300, mini = false }) {
  const items = rooms.map((r) => ({ value: Math.max(roomArea(r), 2), room: r }))
  const ASPECT = 1.25 // ширина / высота схемы
  const rects = squarify(items, ASPECT, 1)
  const GAP = mini ? 1.5 : 3 // px

  return (
    <div className={cn('relative w-full overflow-clip bg-panel', mini ? 'rounded-lg p-0.5' : 'rounded-2xl p-1.5')} style={{ height }}>
      <div className="relative h-full w-full">
        {rects.map(({ room, x, y, w, h }) => {
          const t = roomType(room.type)
          const area = roomArea(room)
          const sel = room.id === selectedId
          const small = w * h < 0.06 * ASPECT
          const tiny = w / ASPECT < 0.3 || h < 0.18
          if (mini) {
            return (
              <span
                key={room.id}
                style={{
                  left: `calc(${(x / ASPECT) * 100}% + ${GAP}px)`,
                  top: `calc(${y * 100}% + ${GAP}px)`,
                  width: `calc(${(w / ASPECT) * 100}% - ${GAP * 2}px)`,
                  height: `calc(${h * 100}% - ${GAP * 2}px)`,
                }}
                className={cn('absolute rounded-[3px]', TONE[room.status] ?? TONE.free)}
              />
            )
          }
          return (
            <motion.button
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={() => onSelect?.(room.id)}
              aria-label={`${room.name}, ${area} м², ${statusLabel(room.status)}`}
              style={{
                left: `calc(${(x / ASPECT) * 100}% + ${GAP}px)`,
                top: `calc(${y * 100}% + ${GAP}px)`,
                width: `calc(${(w / ASPECT) * 100}% - ${GAP * 2}px)`,
                height: `calc(${h * 100}% - ${GAP * 2}px)`,
              }}
              className={cn(
                'absolute flex flex-col justify-between overflow-hidden rounded-xl p-2.5 text-left shadow-soft transition-shadow',
                sel && room.status !== 'work' ? 'bg-brand-100 text-navy ring-2 ring-brand-600' : TONE[room.status] ?? TONE.free,
                sel && room.status === 'work' && 'ring-2 ring-navy ring-offset-2 ring-offset-panel',
              )}
            >
              <span className="flex items-start justify-between gap-1">
                {!tiny && <t.Icon size={16} strokeWidth={2} className="shrink-0 opacity-90" />}
                <span className="ml-auto text-[11.5px] font-bold whitespace-nowrap tabular-nums">{area ? `${area} м²` : '—'}</span>
              </span>
              <span className="min-w-0">
                <span className={cn('block truncate font-extrabold', small ? 'text-[11.5px]' : 'text-[14px]')}>
                  {room.name}
                </span>
                {!small && (
                  <span className={cn('block truncate text-[11px]', sel && room.status !== 'work' ? 'text-brand-700' : SUB[room.status])}>
                    {sel ? 'Выбрана' : statusLabel(room.status)}
                  </span>
                )}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
