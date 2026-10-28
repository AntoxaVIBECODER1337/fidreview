import { useState } from 'react'
import { PRICE_RANGES, RATING_OPTIONS, SPECIALTIES, crewsForCity } from '../data/crews'
import { getWorkIcon } from '../lib/categoryIcons'
import { cn } from '../lib/cn'
import Sheet from './Sheet.jsx'

/** Склонение: 1 бригада, 2-4 бригады, 5+ бригад */
const crewWord = (n) => {
  const w = n % 10
  const h = n % 100
  if (w === 1 && h !== 11) return 'бригада'
  if (w >= 2 && w <= 4 && (h < 12 || h > 14)) return 'бригады'
  return 'бригад'
}

/**
 * Фильтры бригад: специализация работ (можно несколько), цена за м²,
 * минимальная оценка. Черновик применяется кнопкой «Показать N бригад» —
 * как в маркетплейсах. Поиск по названию живёт в строке на странице
 * и учитывается в счётчике.
 */
export default function CrewFiltersSheet({ city, value, query, onApply, onClose }) {
  const [draft, setDraft] = useState(value)

  const toggleSpec = (id) =>
    setDraft((d) => ({
      ...d,
      specialties: d.specialties.includes(id)
        ? d.specialties.filter((s) => s !== id)
        : [...d.specialties, id],
    }))

  const { oma, partners } = crewsForCity(city, { ...draft, query })
  const count = (oma ? 1 : 0) + partners.length

  return (
    <Sheet
      title="Фильтры"
      subtitle="Специализация, цена за м² и оценка бригад"
      onClose={onClose}
      footer={
        <div className="flex gap-2.5">
          <button
            onClick={() => setDraft({ specialties: [], price: 'any', minRating: 0 })}
            className="h-12 shrink-0 rounded-xl border border-line px-5 text-[13.5px] font-bold text-navy transition-colors active:bg-panel"
          >
            Сбросить
          </button>
          <button
            disabled={count === 0}
            onClick={() => onApply(draft)}
            className="h-12 flex-1 rounded-xl bg-brand-600 text-[14px] font-bold text-white transition-colors active:bg-brand-700 disabled:opacity-40"
          >
            {count > 0 ? `Показать ${count} ${crewWord(count)}` : 'Ничего не найдено'}
          </button>
        </div>
      }
    >
      {/* Специализация работ */}
      <section className="pt-1">
        <h3 className="text-[14px] font-extrabold text-navy">Специализация работ</h3>
        <p className="mt-0.5 text-[11.5px] text-muted">Можно выбрать несколько</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => {
            const I = getWorkIcon(s.id)
            const active = draft.specialties.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleSpec(s.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-semibold transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-white text-navy active:bg-panel',
                )}
              >
                <I size={14} strokeWidth={2} /> {s.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Цена за м² */}
      <section className="mt-5">
        <h3 className="text-[14px] font-extrabold text-navy">Цена за м²</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRICE_RANGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setDraft((d) => ({ ...d, price: p.id }))}
              className={cn(
                'rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                draft.price === p.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-white text-navy active:bg-panel',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Оценка */}
      <section className="mt-5">
        <h3 className="text-[14px] font-extrabold text-navy">Оценка</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setDraft((d) => ({ ...d, minRating: r.id }))}
              className={cn(
                'rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                draft.minRating === r.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-white text-navy active:bg-panel',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>
    </Sheet>
  )
}
