import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Handshake, Hammer, HardHat, House, Info, MapPin, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ChatSheet from '../components/ChatSheet.jsx'
import CityPicker from '../components/CityPicker.jsx'
import CrewCard from '../components/CrewCard.jsx'
import CrewSheet from '../components/CrewSheet.jsx'
import { Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { SORTS, SPECIALTIES, crewsForCity, omaCities } from '../data/crews'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'

/**
 * «Бригады» — маркетплейс бригад ОМА.
 * Бригады регистрируются на ОМА как продавцы услуг. Собственная бригада ОМА
 * в городе пользователя всегда сверху и выделена. Выбрать бригаду можно
 * только для проекта, созданного во вкладке «Мой дом».
 */
export default function CrewsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { city, projects, showToast } = useStore()

  const forProject = projects.find((p) => p.id === params.get('project')) ?? null
  const initialSpec = SPECIALTIES.some((s) => s.id === forProject?.scenario) ? forProject.scenario : null

  const [specialty, setSpecialty] = useState(initialSpec)
  const [sort, setSort] = useState('rec')
  const [cityOpen, setCityOpen] = useState(false)
  const [openCrew, setOpenCrew] = useState(null)
  const [chatCrew, setChatCrew] = useState(null)

  const { oma, partners, omaInCity } = crewsForCity(city, { specialty, sort })

  return (
    <div className="min-h-dvh bg-bg">
      {/* Шапка на бренд-градиенте */}
      <header className="relative overflow-clip bg-[linear-gradient(160deg,#1d5dbe_0%,#2a6ccc_55%,#174c9d_100%)] pb-5">
        <div className="mesh-blob absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(127,190,255,0.45),transparent_65%)] blur-2xl" />
        <div className="relative flex h-16 items-center justify-between px-4">
          <h1 className="text-[20px] font-black tracking-tight text-white">Бригады</h1>
          <Tap
            onClick={() => setCityOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3.5 text-[13.5px] font-bold text-white shadow-glass backdrop-blur-md"
          >
            <MapPin size={15} /> {city} <ChevronDown size={15} className="opacity-80" />
          </Tap>
        </div>
        <p className="relative px-4 text-[13px] leading-snug text-white/85">
          Проверенные мастера на маркетплейсе ОМА. Оплата через ОМА — только после приёмки этапа.
        </p>
      </header>

      {/* Фильтр и сортировка — закреплены при прокрутке */}
      <div className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 py-2.5 backdrop-blur-md">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {[{ id: null, label: 'Все работы' }, ...SPECIALTIES].map((s) => {
            const active = specialty === s.id
            return (
              <Tap
                key={s.label}
                onClick={() => setSpecialty(s.id)}
                className={cn(
                  'relative h-9 shrink-0 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors',
                  active ? 'border-brand-600 text-white' : 'border-line bg-white text-navy',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="spec-pill"
                    className="absolute inset-0 rounded-full bg-brand-600"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </Tap>
            )
          })}
        </div>
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto px-4">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                'h-8 shrink-0 rounded-lg px-3 text-[12px] font-semibold transition-colors',
                sort === s.id ? 'bg-navy text-white' : 'bg-white text-muted',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div variants={staggerParent} initial="hidden" animate="show" className="flex flex-col gap-4 px-4 pt-4 pb-6">
        {/* Для какого проекта подбираем */}
        {forProject ? (
          <motion.div
            variants={staggerChild}
            className="flex items-center gap-3 rounded-xl border border-brand-600/25 bg-brand-50 p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <Hammer size={17} className="text-brand-600" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-brand-700">Подбираем бригаду для проекта</span>
              <span className="block truncate text-[13.5px] font-bold text-navy">{forProject.title}</span>
            </span>
            <button
              onClick={() => setParams({})}
              aria-label="Сбросить проект"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          projects.length === 0 && (
            <motion.div variants={staggerChild} className="flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-soft">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <House size={17} className="text-brand-600" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-navy">Чтобы выбрать бригаду, нужен проект</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                  Опишите задачу в «Моём доме» — ИИ соберёт смету и проект
                </span>
                <Tap
                  onClick={() => navigate('/my-home')}
                  className="mt-2 flex items-center gap-1 text-[12.5px] font-bold text-brand-600"
                >
                  Создать проект <ArrowRight size={14} />
                </Tap>
              </span>
            </motion.div>
          )
        )}

        {/* Бригада ОМА — всегда первая */}
        {oma && (
          <motion.section variants={staggerChild} layout>
            <CrewCard crew={oma} onOpen={() => setOpenCrew(oma)} onChat={() => setChatCrew(oma)} />
          </motion.section>
        )}
        {!omaInCity && (
          <motion.div variants={staggerChild} className="flex items-start gap-2.5 rounded-xl bg-accent-soft p-3.5">
            <HardHat size={18} className="mt-0.5 shrink-0 text-accent-dark" />
            <p className="text-[12.5px] leading-snug text-navy">
              В городе {city} бригады ОМА пока нет — работают проверенные партнёры. Бригада ОМА есть в:{' '}
              <b>{omaCities().join(', ')}</b>.
            </p>
          </motion.div>
        )}

        {/* Партнёры */}
        <motion.section variants={staggerChild}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-[15px] font-extrabold text-navy">
              Партнёры ОМА <span className="font-semibold text-muted">• {partners.length}</span>
            </h2>
          </div>

          {partners.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-white px-6 py-8 text-center">
              <Info size={22} className="text-muted" />
              <p className="text-[13px] font-semibold text-navy">Партнёров с такой специализацией в городе пока нет</p>
              <button onClick={() => setSpecialty(null)} className="text-[12.5px] font-bold text-brand-600">
                Показать все работы
              </button>
            </div>
          ) : (
            <motion.div layout className="flex flex-col gap-2.5">
              <AnimatePresence initial={false} mode="popLayout">
                {partners.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  >
                    <CrewCard
                      crew={c}
                      highlightSpecialty={specialty}
                      onOpen={() => setOpenCrew(c)}
                      onChat={() => setChatCrew(c)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>

        {/* Стать партнёром */}
        <motion.div variants={staggerChild} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
              <Handshake size={18} className="text-accent-dark" />
            </span>
            <h3 className="text-[15px] font-extrabold text-navy">Вы бригада? Станьте продавцом ОМА</h3>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-navy">
            <li>• Заказы из проектов покупателей ОМА в вашем городе</li>
            <li>• Покупатель уже купил материалы — вы только работаете</li>
            <li>• Выплаты после приёмки этапа, рейтинг и отзывы как на маркетплейсе</li>
          </ul>
          <Tap
            onClick={() => showToast('Заявка отправлена — менеджер ОМА свяжется в течение дня')}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-brand-600/40 text-[13.5px] font-bold text-brand-600 transition-colors active:bg-brand-50"
          >
            Оставить заявку
          </Tap>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {cityOpen && <CityPicker onClose={() => setCityOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {openCrew && (
          <CrewSheet
            key={openCrew.id}
            crew={openCrew}
            presetProjectId={forProject?.id}
            onClose={() => setOpenCrew(null)}
            onChat={() => {
              setChatCrew(openCrew)
              setOpenCrew(null)
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chatCrew && <ChatSheet key={chatCrew.id} crew={chatCrew} onClose={() => setChatCrew(null)} />}
      </AnimatePresence>
    </div>
  )
}
