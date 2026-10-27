import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Hammer,
  House,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant.jsx'
import AIResultSheet from '../components/AIResultSheet.jsx'
import { Card, PrimaryButton, Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { analyzeTask } from '../lib/ai'
import { cn } from '../lib/cn'
import { categories, getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { PROJECT_STAGES, useStore } from '../store/StoreContext'

/**
 * «Мой дом» — перенос вкладки из репозитория oma-ozon (MyHomeTab):
 * переключатель «Проекты / Корзина», карточки проектов с этапами,
 * корзина с оформлением. Свои данные (products.json, StoreContext),
 * нижнее меню репозитория не используется — живёт наше, из App.jsx.
 */
export default function MyHomePage() {
  const navigate = useNavigate()
  const { cartCount, projects, createProjectFromCart, createProject, approveProject, addToCart, showToast } =
    useStore()
  const [mode, setMode] = useState('projects')
  /* ИИ-подборка: { task, result } */
  const [ai, setAi] = useState(null)

  const scrollToList = () =>
    setTimeout(() => document.getElementById('mh-list')?.scrollIntoView({ behavior: 'smooth' }), 350)

  const aiToCart = (items) => {
    for (const i of items) addToCart(i.id, i.qty)
    showToast(`В корзину добавлено ${items.length} поз.`)
    setAi(null)
    setMode('cart')
    scrollToList()
  }

  const aiToProject = ({ items, crew, area }) => {
    createProject({ title: ai.task, items, crew, area })
    setAi(null)
    setMode('projects')
    scrollToList()
  }

  const openProject = (id) => navigate(`/my-home/project/${id}`)

  const createFromCart = () => {
    const p = createProjectFromCart()
    if (p) setMode('projects')
  }

  const MODES = [
    { v: 'projects', label: 'Проекты' },
    { v: 'cart', label: 'Корзина' },
  ]

  return (
    <div>
      {/* ИИ-помощник — скрипт вкладки «Главное» из oma-ozon */}
      <AIAssistant onResult={(task) => setAi({ task, result: analyzeTask(task) })} />

      <AnimatePresence>
        {ai && (
          <AIResultSheet
            task={ai.task}
            result={ai.result}
            onClose={() => setAi(null)}
            onToCart={aiToCart}
            onToProject={aiToProject}
          />
        )}
      </AnimatePresence>

      {/* Сегмент-тумблер Проекты / Корзина */}
      <div id="mh-list" className="scroll-mt-2 px-4 pt-1">
        <div className="relative flex rounded-xl bg-panel p-1">
          {MODES.map((o) => (
            <button
              key={o.v}
              onClick={() => setMode(o.v)}
              className={cn(
                'relative flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors hide-tap',
                mode === o.v ? 'text-white' : 'text-muted',
              )}
            >
              {mode === o.v && (
                <motion.span
                  layoutId="mh-toggle"
                  className="absolute inset-0 rounded-lg bg-brand-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {o.label}
                {o.v === 'cart' && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                    className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-black text-white"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Контент с горизонтальным переключением */}
      <AnimatePresence mode="wait" initial={false}>
        {mode === 'projects' ? (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              variants={staggerParent}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 px-4 pt-3 pb-6"
            >
              {projects.length === 0 ? (
                <motion.div variants={staggerChild}>
                  <Card className="flex flex-col items-center gap-3 px-8 py-10 text-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
                      <House size={34} className="text-brand-600" strokeWidth={1.5} />
                    </span>
                    <h2 className="text-[16px] font-extrabold text-navy">Проектов пока нет</h2>
                    <p className="text-[12.5px] leading-relaxed text-muted">
                      Опишите задачу выше — ИИ соберёт смету и проект с бригадой. Или
                      соберите проект из товаров в корзине
                    </p>
                    <Tap
                      onClick={() => setMode('cart')}
                      className="mt-1 flex items-center gap-1.5 rounded-lg border border-brand-600/40 bg-white px-4 py-2.5 text-[13px] font-bold text-brand-600 transition-colors active:bg-brand-50"
                    >
                      Перейти в корзину <ArrowRight size={15} />
                    </Tap>
                  </Card>
                </motion.div>
              ) : (
                projects.map((p) => (
                  <motion.div key={p.id} variants={staggerChild}>
                    <ProjectCard
                      project={p}
                      onOpen={() => openProject(p.id)}
                      onApprove={() => approveProject(p.id)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="cart"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22 }}
          >
            <CartView
              onGoHome={() => navigate('/')}
              onCheckout={() => navigate('/checkout')}
              onCreateProject={createFromCart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Карточка проекта: статус, состав, сумма, CTA */
function ProjectCard({ project, onOpen, onApprove }) {
  const pending = project.status === 'pending'
  return (
    <Card className="overflow-hidden">
      <div className="flex items-stretch gap-3.5 p-4">
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
              'Своими силами • материалы ОМА'
            )}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">
            {project.items.length} поз. • материалы {rub(round2(project.itemsTotal))}
            {project.crewTotal > 0 && ` • работа ${rub(project.crewTotal)}`}
          </p>
          <p className="mt-1.5 text-[15px] font-black text-navy">
            {rub(round2(project.itemsTotal + project.crewTotal))}
          </p>
        </div>
      </div>

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

/** Режим «Корзина»: мои товары из StoreContext + оформление */
function CartView({ onGoHome, onCheckout, onCreateProject }) {
  const { cart, cartCount, setQty, removeFromCart } = useStore()

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: getProduct(id), qty }))
    .filter((l) => l.product)
  const cartTotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0)

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-10 pt-16 pb-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-panel">
          <ShoppingBag size={34} className="text-muted" strokeWidth={1.5} />
        </span>
        <h2 className="text-[16px] font-extrabold text-navy">Корзина пуста</h2>
        <p className="text-[12.5px] leading-relaxed text-muted">
          Добавьте товары из каталога — из корзины можно собрать проект с этапами работ
          или оформить заказ
        </p>
        <Tap
          onClick={onGoHome}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-brand-600/40 bg-white px-4 py-2.5 text-[13px] font-bold text-brand-600 transition-colors active:bg-brand-50"
        >
          На главную <ArrowRight size={15} />
        </Tap>
      </div>
    )
  }

  // группировка по категориям каталога
  const groups = lines.reduce((acc, l) => {
    const cat = categories.find((c) => c.id === l.product.cat)
    const key = cat ? cat.name : 'Товары'
    ;(acc[key] = acc[key] ?? []).push(l)
    return acc
  }, {})

  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      className="flex flex-col gap-4 px-4 pt-3 pb-6"
    >
      {Object.entries(groups).map(([cat, catLines]) => (
        <motion.section key={cat} variants={item}>
          <h2 className="mb-2 px-1 text-[12px] font-bold tracking-wide text-muted uppercase">{cat}</h2>
          <div className="flex flex-col gap-2">
            {catLines.map((l) => (
              <Card key={l.product.id} className="flex items-center gap-3 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-panel text-[24px]">
                  {l.product.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13px] font-bold text-navy">{l.product.name}</p>
                  <p className="text-[11px] text-muted">
                    {l.product.brand} • {rub(l.product.price)} / {l.product.unit}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-line">
                      <Tap
                        onClick={() => setQty(l.product.id, l.qty - 1)}
                        aria-label="Меньше"
                        className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted active:bg-panel"
                      >
                        <Minus size={13} />
                      </Tap>
                      <span className="w-6 text-center text-[12.5px] font-bold text-navy">{l.qty}</span>
                      <Tap
                        onClick={() => setQty(l.product.id, l.qty + 1)}
                        aria-label="Больше"
                        className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted active:bg-panel"
                      >
                        <Plus size={13} />
                      </Tap>
                    </div>
                    <span className="text-[13.5px] font-black text-navy">
                      {rub(round2(l.product.price * l.qty))}
                    </span>
                  </div>
                </div>
                <Tap
                  onClick={() => removeFromCart(l.product.id)}
                  aria-label="Удалить"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors active:bg-red-50 active:text-price"
                >
                  <Trash2 size={16} />
                </Tap>
              </Card>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Получение */}
      <motion.div variants={item}>
        <Card className="p-4">
          <h2 className="mb-3 text-[15px] font-extrabold text-navy">Получение</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                <Truck size={17} className="text-brand-600" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-navy">Доставка с подъёмом</p>
                <p className="text-[11.5px] text-muted">
                  {cartTotal >= 200 ? 'Бесплатно (заказ от 200 р.)' : '18.90 р., завтра'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                <MapPin size={17} className="text-brand-600" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-navy">Самовывоз</p>
                <p className="text-[11.5px] text-muted">32 магазина, сегодня к 18:00</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Итог */}
      <motion.div variants={item}>
        <Card className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-muted">{cartCount} шт. в корзине</span>
            <span className="text-[19px] font-black whitespace-nowrap text-navy">{rub(round2(cartTotal))}</span>
          </div>
          <PrimaryButton className="mt-3 w-full" onClick={onCheckout}>
            Оформить заказ
          </PrimaryButton>
          <Tap
            onClick={onCreateProject}
            className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-brand-600/40 bg-white text-[13.5px] font-bold text-brand-600 transition-colors active:bg-brand-50"
          >
            <Hammer size={15} /> Собрать проект из корзины
          </Tap>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const round2 = (n) => Math.round(n * 100) / 100
