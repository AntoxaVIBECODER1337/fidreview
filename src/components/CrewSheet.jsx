import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Check, Hammer, HardHat, House, MessageCircle, Minus, Plus, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { crewSnapshot, specialtyLabel, startLabel } from '../data/crews'
import { cn } from '../lib/cn'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import { ContactList } from './CrewContacts.jsx'
import Sheet from './Sheet.jsx'
import { PrimaryButton, Tap } from './ui.jsx'

/**
 * Карточка бригады + выбор для проекта.
 * Выбрать бригаду можно только для проекта из «Моего дома»:
 * если проектов нет — ведём создавать проект.
 */
export default function CrewSheet({ crew, presetProjectId, onClose, onChat }) {
  const navigate = useNavigate()
  const { projects, assignCrew } = useStore()
  const preset = projects.find((p) => p.id === presetProjectId)
  const [step, setStep] = useState('info')
  const [projectId, setProjectId] = useState(
    preset?.id ?? projects.find((p) => !p.crew)?.id ?? projects[0]?.id ?? null,
  )
  const project = projects.find((p) => p.id === projectId)
  const [area, setArea] = useState(project?.area ?? 20)

  const pickProject = (p) => {
    setProjectId(p.id)
    if (p.area) setArea(p.area)
  }

  const choose = () => setStep(projects.length ? 'assign' : 'noProject')

  const confirm = () => {
    assignCrew(project.id, crewSnapshot(crew), area)
    onClose()
    navigate(`/my-home/project/${project.id}`)
  }

  const footer =
    step === 'info' ? (
      <div className="flex gap-2">
        <Tap
          onClick={onChat}
          className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-600/40 bg-white px-4 text-[14px] font-bold text-brand-600 active:bg-brand-50"
        >
          <MessageCircle size={17} /> Написать
        </Tap>
        <PrimaryButton className="flex-1" onClick={choose}>
          Выбрать для проекта
        </PrimaryButton>
      </div>
    ) : step === 'assign' ? (
      <div>
        <div className="mb-2.5 flex items-baseline justify-between px-1">
          <span className="text-[12.5px] font-semibold text-muted">
            {crew.rate} р. × {area} м²
          </span>
          <span className="text-[17px] font-black text-navy">{rub(crew.rate * area)}</span>
        </div>
        <PrimaryButton className="w-full" onClick={confirm} disabled={!project}>
          Подтвердить бригаду
        </PrimaryButton>
      </div>
    ) : (
      <PrimaryButton
        className="w-full"
        onClick={() => {
          onClose()
          navigate('/my-home')
        }}
      >
        <span className="flex items-center justify-center gap-2">
          Создать проект в «Моём доме» <ArrowRight size={17} />
        </span>
      </PrimaryButton>
    )

  return (
    <Sheet
      title={
        <span className="flex items-center gap-1.5">
          {crew.name}
          {crew.isOma ? (
            <HardHat size={18} className="text-brand-600" />
          ) : (
            <BadgeCheck size={18} className="text-brand-600" />
          )}
        </span>
      }
      subtitle={crew.isOma ? 'Официальная бригада ОМА' : 'Продавец услуг на маркетплейсе ОМА • проверен'}
      onClose={onClose}
      footer={footer}
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <Info crew={crew} />
          </motion.div>
        )}

        {step === 'noProject' && (
          <motion.div
            key="none"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="flex flex-col items-center gap-3 px-4 pt-6 pb-4 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
              <House size={34} className="text-brand-600" strokeWidth={1.5} />
            </span>
            <h3 className="text-[16px] font-extrabold text-navy">Сначала создайте проект</h3>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Бригада работает по проекту: объём, материалы и смета. Опишите задачу во вкладке
              «Мой дом» — ИИ соберёт проект, и вы вернётесь сюда выбрать бригаду.
            </p>
          </motion.div>
        )}

        {step === 'assign' && project && (
          <motion.div key="assign" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
            <p className="mb-2 px-1 pt-1 text-[13px] font-bold text-navy">Для какого проекта?</p>
            <div className="flex flex-col gap-2">
              {projects.map((p) => {
                const sel = p.id === projectId
                return (
                  <button
                    key={p.id}
                    onClick={() => pickProject(p)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                      sel ? 'border-brand-600 bg-brand-50/50' : 'border-line bg-white',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        sel ? 'border-brand-600 bg-brand-600' : 'border-line bg-white',
                      )}
                    >
                      {sel && <Check size={13} className="text-white" strokeWidth={3.5} />}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Hammer size={17} className="text-brand-600" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-navy">{p.title}</span>
                      <span className="block truncate text-[11.5px] text-muted">
                        {p.crew ? `Сейчас: ${p.crew.name}` : 'Бригада не выбрана'} • {p.items.length} поз.
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="mt-4 mb-2 px-1 text-[13px] font-bold text-navy">Площадь работ</p>
            <div className="flex items-center justify-between rounded-xl border border-line bg-white p-2">
              <Tap
                onClick={() => setArea((a) => Math.max(1, a - 5))}
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
                onClick={() => setArea((a) => Math.min(500, a + 5))}
                aria-label="Больше"
                className="flex h-10 w-12 items-center justify-center rounded-lg bg-panel text-navy"
              >
                <Plus size={16} />
              </Tap>
            </div>
            <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-muted">
              Бригада свяжется, приедет на бесплатный замер и подтвердит смету. Оплата — через
              ОМА после приёмки каждого этапа.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}

function Info({ crew }) {
  const stats = [
    { label: 'Опыт', value: `${crew.years} ${crew.years < 5 ? 'года' : 'лет'}` },
    { label: 'В бригаде', value: `${crew.team} чел.` },
    { label: 'Гарантия', value: `${crew.guarantee} ${crew.guarantee === 1 ? 'год' : 'года'}` },
    { label: 'Старт', value: startLabel(crew.startDays).replace('старт ', '') },
  ]
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-center justify-between rounded-xl bg-panel px-4 py-3">
        <span className="flex items-center gap-1.5 text-[14px] font-bold text-navy">
          <Star size={16} fill="currentColor" className="text-accent" />
          {crew.rating}
          <span className="text-[12px] font-medium text-muted">• {crew.reviews} отзывов</span>
        </span>
        <span className="text-[17px] font-black text-navy">
          {crew.rate} р.<span className="text-[11px] font-medium text-muted"> / м²</span>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line px-2 py-2.5 text-center">
            <div className="text-[13px] leading-tight font-black text-navy">{s.value}</div>
            <div className="mt-0.5 text-[10.5px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <p className="text-[13px] leading-relaxed text-navy">{crew.about}</p>

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Специализация</p>
        <div className="flex flex-wrap gap-1.5">
          {crew.specialties.map((s) => (
            <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-semibold text-brand-700">
              {specialtyLabel(s)}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Связаться до оформления проекта</p>
        <ContactList crew={crew} />
      </div>

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Работает в городах</p>
        <p className="text-[12.5px] text-muted">{crew.cities.join(', ')}</p>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Отзывы</p>
        <div className="flex flex-col gap-2">
          {crew.reviewsList.map((r) => (
            <div key={r.author} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-navy">{r.author}</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < r.rating ? 'text-accent' : 'text-line'}
                      fill="currentColor"
                    />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] leading-snug text-navy/85">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
