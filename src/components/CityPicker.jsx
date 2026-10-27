import { Check, HardHat } from 'lucide-react'
import { CITIES, omaCities } from '../data/crews'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'
import Sheet from './Sheet.jsx'

/** Выбор города: от него зависит список бригад и наличие бригады ОМА */
export default function CityPicker({ onClose }) {
  const { city, setCity } = useStore()
  const withOma = omaCities()

  return (
    <Sheet title="Ваш город" subtitle="Покажем бригады, которые работают рядом" onClose={onClose} maxH="70dvh">
      <ul className="flex flex-col gap-1.5 pt-1">
        {CITIES.map((c) => {
          const active = c === city
          return (
            <li key={c}>
              <button
                onClick={() => {
                  setCity(c)
                  onClose()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors',
                  active ? 'border-brand-600 bg-brand-50/60' : 'border-line bg-white active:bg-panel',
                )}
              >
                <span className="flex-1 text-[15px] font-bold text-navy">{c}</span>
                {withOma.includes(c) && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-bold text-white">
                    <HardHat size={11} /> Бригада ОМА
                  </span>
                )}
                {active && <Check size={18} className="text-brand-600" strokeWidth={3} />}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
