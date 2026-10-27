import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, HardHat, Minus, Plus, Star } from 'lucide-react'
import { SPECIALTIES, crewSnapshot, crewsForCity, startLabel } from '../data/crews'
import { cn } from '../lib/cn'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import Sheet from './Sheet.jsx'
import { PrimaryButton, Tap } from './ui.jsx'

const TITLES = {
  floors: 'Стяжка и полы',
  bath: 'Ремонт ванной',
  electric: 'Электрика',
  walls: 'Отделка стен',
  heating: 'Отопление',
  furniture: 'Мебель и сборка',
  garden: 'Благоустройство участка',
}

/**
 * Ручное создание проекта: название, вид работ, площадь и бригада —
 * без бригады, бригада ОМА или любой партнёр из «Бригад» в городе пользователя.
 */
export default function NewProjectSheet({ onClose, onCreated }) {
  const { city, createProject } = useStore()
  const [title, setTitle] = useState('')
  const [scenario, setScenario] = useState('bath')
  const [area, setArea] = useState(10)
  const [crewId, setCrewId] = useState('none')

  const crews = useMemo(() => {
    const { oma, partners } = crewsForCity(city, { specialty: scenario })
    return oma ? [oma, ...partners] : partners
  }, [city, scenario])

  const crew = crews.find((c) => c.id === crewId) ?? null

  const create = () => {
    const p = createProject({
      title: title.trim() || TITLES[scenario],
      items: [],
      crew: crew ? crewSnapshot(crew) : null,
      area,
      scenario,
    })
    onCreated?.(p)
    onClose()
  }

  return (
    <Sheet
      title="Новый проект"
      subtitle="Создайте проект сами и выберите бригаду — материалы можно добавить позже"
      onClose={onClose}
      footer={
        <div>
          {crew && (
            <div className="mb-2.5 flex items-baseline justify-between px-1">
              <span className="text-[12.5px] font-semibold text-muted">
                Работа {crew.name}: {crew.rate} р. × {area} м²
              </span>
              <span className="text-[17px] font-black text-navy">{rub(crew.rate * area)}</span>
            </div>
          )}
          <PrimaryButton className="w-full" onClick={create}>
            Создать проект
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <div>
          <p className="mb-2 px-1 text-[13px] font-bold text-navy">Название</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={TITLES[scenario]}
            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-navy placeholder:text-muted focus:border-brand-500"
          />
        </div>

        <div>
          <p className="mb-2 px-1 text-[13px] font-bold text-navy">Вид работ</p>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTIES.map((s) => {
              const active = s.id === scenario
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setScenario(s.id)
                    setCrewId('none')
                  }}
                  className={cn(
                    'h-9 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors',
                    active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-navy',
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-[13px] font-bold text-navy">Площадь</p>
          <div className="flex items-center justify-between rounded-xl border border-line bg-white p-2">
            <Tap
              onClick={() => setArea((a) => Math.max(1, a - (a > 10 ? 5 : 1)))}
              aria-label="Меньше"
              className="flex h-10 w-12 items-center justify-center rounded-lg bg-panel text-navy"
            >
              <Minus size={16} />
            </Tap>
            <motion.span
              key={area}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[20px] font-black text-navy"
            >
              {area} м²
            </motion.span>
            <Tap
              onClick={() => setArea((a) => Math.min(500, a + (a >= 10 ? 5 : 1)))}
              aria-label="Больше"
              className="flex h-10 w-12 items-center justify-center rounded-lg bg-panel text-navy"
            >
              <Plus size={16} />
            </Tap>
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-[13px] font-bold text-navy">
            Бригада <span className="font-medium text-muted">· г. {city}</span>
          </p>
          <div className="flex flex-col gap-2">
            <Option selected={crewId === 'none'} onClick={() => setCrewId('none')}>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-navy">Без бригады</span>
                <span className="block text-[11.5px] text-muted">Сделаю сам или выберу позже</span>
              </span>
            </Option>

            {crews.map((c) => (
              <Option key={c.id} selected={crewId === c.id} onClick={() => setCrewId(c.id)} oma={c.isOma}>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white',
                    c.isOma ? 'bg-brand-600' : 'bg-navy',
                  )}
                >
                  {c.isOma ? <HardHat size={17} /> : c.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[13.5px] font-bold text-navy">{c.name}</span>
                    <span className="flex items-center gap-0.5 text-[11.5px] font-bold text-accent">
                      <Star size={11} fill="currentColor" />
                      {c.rating}
                    </span>
                  </span>
                  <span className="block truncate text-[11.5px] text-muted">
                    {c.isOma ? (
                      <span className="font-bold text-brand-600">Официальная бригада ОМА · </span>
                    ) : (
                      'Партнёр ОМА · '
                    )}
                    {c.rate} р./м² · {startLabel(c.startDays)}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-black whitespace-nowrap text-navy">
                  {rub(c.rate * area)}
                </span>
              </Option>
            ))}

            {crews.length === 0 && (
              <p className="px-1 text-[12px] text-muted">
                В г. {city} пока нет бригад с такой специализацией — можно выбрать позже во вкладке «Бригады».
              </p>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  )
}

function Option({ selected, onClick, oma, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors',
        selected ? 'border-brand-600 bg-brand-50/60' : oma ? 'border-brand-600/30 bg-brand-50/30' : 'border-line bg-white',
      )}
    >
      <span
        className={cn(
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-brand-600 bg-brand-600' : 'border-line bg-white',
        )}
      >
        {selected && <Check size={13} className="text-white" strokeWidth={3.5} />}
      </span>
      {children}
    </button>
  )
}
