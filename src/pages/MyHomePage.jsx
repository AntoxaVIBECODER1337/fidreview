import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Hammer, HardHat, House, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant.jsx'
import AIResultSheet from '../components/AIResultSheet.jsx'
import NewProjectSheet from '../components/NewProjectSheet.jsx'
import { Card, Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { analyzeTask } from '../lib/ai'
import { cn } from '../lib/cn'
import { rub } from '../lib/format'
import { PROJECT_STAGES, useStore } from '../store/StoreContext'

/**
 * «Мой дом» — ИИ-помощник (скрипт «Главное» из oma-ozon) и проекты ремонта.
 * ИИ спрашивает: проект или просто закупка. Закупка уходит в «Корзину»,
 * проект — сюда, с этапами и выбором бригады.
 */
export default function MyHomePage() {
  const navigate = useNavigate()
  const { projects, createProject, approveProject, addToCart, showToast } = useStore()
  /* ИИ-подборка: { task, mode, result } */
  const [ai, setAi] = useState(null)
  const [manual, setManual] = useState(false)

  const scrollToList = () =>
    setTimeout(() => document.getElementById('mh-list')?.scrollIntoView({ behavior: 'smooth' }), 350)

  const aiToCart = (items) => {
    for (const i of items) addToCart(i.id, i.qty)
    showToast(`В корзину добавлено ${items.length} поз.`)
    setAi(null)
    navigate('/cart')
  }

  const aiToProject = ({ items, crew, area }) => {
    createProject({ title: ai.task, items, crew, area, scenario: ai.result.scenario.id })
    setAi(null)
    scrollToList()
  }

  const openProject = (id) => navigate(`/my-home/project/${id}`)

  return (
    <div>
      <AIAssistant onResult={(task, mode) => setAi({ task, mode, result: analyzeTask(task) })} />

      <AnimatePresence>
        {ai && (
          <AIResultSheet
            task={ai.task}
            mode={ai.mode}
            result={ai.result}
            onClose={() => setAi(null)}
            onToCart={aiToCart}
            onToProject={aiToProject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {manual && <NewProjectSheet onClose={() => setManual(false)} onCreated={scrollToList} />}
      </AnimatePresence>

      {/* Проекты */}
      <section id="mh-list" className="scroll-mt-2 px-4 pt-1 pb-6">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-[18px] font-bold text-navy">
            Мои проекты
            {projects.length > 0 && <span className="ml-1.5 text-[13px] font-semibold text-muted">{projects.length}</span>}
          </h2>
          <Tap
            onClick={() => setManual(true)}
            className="flex h-9 items-center gap-1 rounded-full border border-brand-600/40 bg-white px-3 text-[12.5px] font-bold text-brand-600 active:bg-brand-50"
          >
            <Plus size={15} /> Создать вручную
          </Tap>
        </div>
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <motion.div variants={staggerChild}>
              <Card className="flex flex-col items-center gap-3 px-8 py-10 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
                  <House size={34} className="text-brand-600" strokeWidth={1.5} />
                </span>
                <h2 className="text-[16px] font-extrabold text-navy">Проектов пока нет</h2>
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Опишите задачу выше и выберите «Проект ремонта» — ИИ соберёт смету и этапы. Или
                  создайте проект сами и сразу выберите бригаду
                </p>
                <Tap
                  onClick={() => setManual(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)] active:bg-brand-700"
                >
                  <Plus size={15} /> Создать проект вручную
                </Tap>
              </Card>
            </motion.div>
          ) : (
            projects.map((p) => (
              <motion.div key={p.id} variants={staggerChild} layout>
                <ProjectCard
                  project={p}
                  onOpen={() => openProject(p.id)}
                  onApprove={() => approveProject(p.id)}
                  onPickCrew={() => navigate(`/crews?project=${p.id}`)}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </div>
  )
}

/** Карточка проекта: статус, состав, сумма, CTA */
function ProjectCard({ project, onOpen, onApprove, onPickCrew }) {
  const pending = project.status === 'pending'
  return (
    <Card className="overflow-hidden">
      <Tap onClick={onOpen} className="flex w-full items-stretch gap-3.5 p-4 text-left">
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
            pending ? 'bg-amber-50' : 'bg-brand-50',
          )}
        >
          <Hammer
            size={24}
            className={pending ? 'text-amber-500' : 'text-brand-600'}
            strokeWidth={1.8}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-extrabold leading-tight text-navy">
              {project.title}
            </h3>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold',
                pending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600',
              )}
            >
              {pending ? 'Ожидает' : 'В работе'}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {project.crew ? (
              <span className="font-semibold text-brand-600">
                Бригада {project.crew.name} • {project.area} м²
              </span>
            ) : (
              'Без бригады • материалы ОМА'
            )}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">
            {project.items.length
              ? `${project.items.length} поз. • материалы ${rub(round2(project.itemsTotal))}`
              : 'Материалы уточнятся на замере'}
            {project.crewTotal > 0 && ` • работа ${rub(project.crewTotal)}`}
          </p>
          <p className="mt-1.5 text-[15px] font-black text-navy">
            {rub(round2(project.itemsTotal + project.crewTotal))}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 self-center text-muted" />
      </Tap>

      {!project.crew && (
        <Tap
          onClick={onPickCrew}
          className="flex w-full items-center justify-between border-t border-line bg-brand-50/50 px-4 py-2.5 text-left"
        >
          <span className="flex items-center gap-2 text-[12.5px] font-bold text-brand-700">
            <HardHat size={15} /> Выбрать бригаду для проекта
          </span>
          <ChevronRight size={16} className="text-brand-600" />
        </Tap>
      )}
      {pending ? (
        <div className="border-t border-line p-3">
          <Tap
            onClick={onApprove}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-brand-600 text-[14px] font-semibold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)] transition-colors active:bg-brand-700"
          >
            Оформить и начать работу
          </Tap>
        </div>
      ) : (
        <Tap
          onClick={onOpen}
          className="flex w-full items-center justify-between border-t border-line p-3 text-left"
        >
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-600">
            Этап {project.currentStage + 1} из {PROJECT_STAGES.length} • открыть проект
          </span>
          <ChevronRight size={17} className="text-brand-600" />
        </Tap>
      )}
    </Card>
  )
}

const round2 = (n) => Math.round(n * 100) / 100
