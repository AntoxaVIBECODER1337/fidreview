import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronRight, HardHat, MessageCircleMore, ShieldCheck, ShoppingBag, Star, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatSheet from '../components/ChatSheet.jsx'
import { QuickContact } from '../components/CrewContacts.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { crewById } from '../data/crews'
import { Card, PrimaryButton, Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { PROJECT_STAGES, useStore } from '../store/StoreContext'
import { HelpCircle } from 'lucide-react'

const STAGE_HINTS = [
  'Бригада свяжется и зафиксирует смету на объекте',
  'Материалы ОМА привезут с подъёмом на этаж',
  'Начинаются черновые работы',
  'Финишная отделка и подписание акта',
]

const round2 = (n) => Math.round(n * 100) / 100

/** Экран проекта (перенос Project.tsx из oma-ozon) */
export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, approveProject, advanceStage, showToast } = useStore()
  const [chatOpen, setChatOpen] = useState(false)
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return <EmptyState icon={HelpCircle} title="Проект не найден" buttonLabel="Мой дом" to="/my-home" />
  }

  /* Полные данные бригады (контакты, ответы в чате) по снимку из проекта */
  const crew = project.crew ? { ...crewById(project.crew.id), ...project.crew } : null

  const pending = project.status === 'pending'
  const finished = !pending && project.currentStage >= PROJECT_STAGES.length - 1
  const lines = project.items
    .map((i) => ({ product: getProduct(i.id), qty: i.qty }))
    .filter((l) => l.product)
  const total = project.itemsTotal + project.crewTotal

  const onCta = () => {
    if (pending) approveProject(project.id)
    else if (!finished) {
      advanceStage(project.id)
      showToast(
        project.currentStage + 1 >= PROJECT_STAGES.length - 1
          ? 'Финальный этап — приёмка работ'
          : 'Этап подтверждён',
      )
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      {/* Hero */}
      <div className="relative overflow-clip bg-[linear-gradient(135deg,#1d5dbe_0%,#174c9d_100%)] pb-6">
        <div className="mesh-blob absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" />
        <Tap
          onClick={() => navigate('/my-home')}
          aria-label="Назад"
          className="absolute top-3 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/20 shadow-glass backdrop-blur-md"
        >
          <ArrowLeft size={19} className="text-white" />
        </Tap>
        <div className="flex h-16 items-center justify-center px-14">
          <span className="line-clamp-1 text-[14px] font-bold text-white/90">
            {pending ? 'Новый проект' : 'Проект'}
          </span>
        </div>
        <div className="relative px-5">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[24px] leading-tight font-black text-white drop-shadow"
          >
            {project.title}
          </motion.h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                pending
                  ? 'bg-amber-300/90 text-amber-900'
                  : finished
                    ? 'bg-white/90 text-brand-700'
                    : 'bg-emerald-300/90 text-emerald-900'
              }`}
            >
              {pending ? 'Ожидает подтверждения' : finished ? 'Финальный этап' : 'В работе'}
            </span>
            {project.crew && (
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <Users size={12} />
                {project.crew.name} • {project.crew.rate} р./м²
              </span>
            )}
          </div>
        </div>
      </div>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pt-4 pb-6"
      >
        {/* Бригада */}
        <motion.div variants={staggerChild}>
          {project.crew ? (
            <Card className="p-4">
              <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-black text-white ${
                  project.crew.isOma ? 'bg-brand-600' : 'bg-navy'
                }`}
              >
                {project.crew.isOma ? <HardHat size={20} /> : project.crew.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-muted">
                  {project.crew.isOma ? 'Официальная бригада ОМА' : 'Бригада-партнёр ОМА'}
                </span>
                <span className="flex items-center gap-1.5 text-[15px] font-extrabold text-navy">
                  {project.crew.name}
                  <span className="flex items-center gap-0.5 text-[12px] font-bold text-accent">
                    <Star size={11} fill="currentColor" />
                    {project.crew.rating}
                  </span>
                </span>
                <span className="block text-[11.5px] text-muted">
                  {project.crew.rate} р./м² • {project.area} м²
                </span>
              </span>
              {pending && (
                <Tap
                  onClick={() => navigate(`/crews?project=${project.id}`)}
                  className="shrink-0 rounded-lg border border-brand-600/30 px-3 py-2 text-[12px] font-bold text-brand-600 active:bg-brand-50"
                >
                  Сменить
                </Tap>
              )}
              </div>
              <QuickContact crew={crew} onChat={() => setChatOpen(true)} className="mt-3" />
            </Card>
          ) : (
            <Tap
              onClick={() => navigate(`/crews?project=${project.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-brand-600/40 bg-brand-50/50 p-4 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                <HardHat size={20} className="text-brand-600" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-navy">Бригада не выбрана</span>
                <span className="block text-[12px] text-muted">Бригада ОМА и проверенные партнёры вашего города</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-brand-600" />
            </Tap>
          )}
        </motion.div>

        {/* Этапы */}
        <motion.div variants={staggerChild}>
          <Card className="p-4">
            <h2 className="mb-3 text-[15px] font-extrabold text-navy">Этапы работ</h2>
            <ul className="flex flex-col">
              {PROJECT_STAGES.map((st, i) => {
                const done = !pending && i < project.currentStage
                const current = !pending && i === project.currentStage
                return (
                  <li key={st.name} className="relative flex gap-3.5 pb-4 last:pb-0">
                    {i < PROJECT_STAGES.length - 1 && (
                      <span
                        className={`absolute top-6 left-[11px] h-[calc(100%-14px)] w-0.5 transition-colors duration-500 ${
                          done ? 'bg-brand-600/60' : 'bg-line'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                        done
                          ? 'border-brand-600 bg-brand-600'
                          : current
                            ? 'border-brand-600 bg-white'
                            : 'border-line bg-white'
                      }`}
                    >
                      {done ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={12} className="text-white" strokeWidth={3.5} />
                        </motion.span>
                      ) : current ? (
                        <motion.span
                          className="h-2 w-2 rounded-full bg-brand-600"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.6 }}
                        />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-line" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13.5px] leading-snug ${
                          current ? 'font-bold text-navy' : done ? 'font-medium text-navy' : 'text-muted'
                        }`}
                      >
                        {st.name}
                        {current && (
                          <span className="ml-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 align-middle text-[10px] font-bold whitespace-nowrap text-brand-700">
                            в работе
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-muted">{STAGE_HINTS[i]}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        </motion.div>

        {/* Материалы */}
        <motion.div variants={staggerChild}>
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-navy">
              <ShoppingBag size={16} className="text-brand-600" />
              Материалы ОМА • {lines.length} поз.
            </h2>
            <div className="flex flex-col gap-2">
              {lines.slice(0, 5).map((l) => (
                <div key={l.product.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-navy">
                    <span className="text-[15px]">{l.product.emoji}</span>
                    <span className="truncate">{l.product.name}</span>
                    <span className="shrink-0 text-muted">×{l.qty}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-semibold text-muted">
                    {rub(round2(l.product.price * l.qty))}
                  </span>
                </div>
              ))}
              {lines.length > 5 && (
                <p className="text-[11.5px] text-muted">…и ещё {lines.length - 5} поз.</p>
              )}
              {lines.length === 0 && (
                <p className="text-[12.5px] text-muted">Материалы уточняются на замере</p>
              )}
            </div>
            <div className="mt-3 border-t border-dashed border-line pt-2.5">
              <div className="flex justify-between text-[12.5px]">
                <span className="text-muted">Материалы</span>
                <span className="font-semibold text-navy">{rub(round2(project.itemsTotal))}</span>
              </div>
              {project.crewTotal > 0 && (
                <div className="mt-1 flex justify-between text-[12.5px]">
                  <span className="text-brand-600">
                    Работа {project.crew?.name} • {project.area} м²
                  </span>
                  <span className="font-semibold text-brand-600">{rub(project.crewTotal)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between">
                <span className="text-[13px] font-bold text-navy">Итого</span>
                <span className="text-[15px] font-black text-navy">{rub(round2(total))}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Гарантия */}
        <motion.div
          variants={staggerChild}
          className="flex items-center gap-3 rounded-xl border border-brand-600/20 bg-brand-50/60 p-3.5"
        >
          <ShieldCheck size={20} className="shrink-0 text-brand-600" />
          <p className="text-[12.5px] leading-snug text-navy">
            Гарантия на работы — <b>{crew?.guarantee ?? 2} {(crew?.guarantee ?? 2) === 1 ? 'год' : 'года'}</b>. Чат с бригадой — кнопка слева, до и после оформления.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div variants={staggerChild} className="flex gap-2.5">
          <Tap
            onClick={() =>
              crew ? setChatOpen(true) : showToast('Сначала выберите бригаду — потом можно написать ей')
            }
            aria-label="Чат"
            className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg border border-brand-600/30 bg-white text-brand-600 transition-colors active:bg-brand-50"
          >
            <MessageCircleMore size={20} />
          </Tap>
          <PrimaryButton className="flex-1" onClick={onCta} disabled={finished}>
            {pending ? 'Оформить и начать работу' : finished ? 'Проект на приёмке' : 'Подтвердить этап'}
          </PrimaryButton>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {chatOpen && crew && <ChatSheet crew={crew} onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
