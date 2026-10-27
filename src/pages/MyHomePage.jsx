import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  CircleUserRound,
  Hammer,
  House,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, PrimaryButton, Tap, staggerChild, staggerParent } from '../components/ui.jsx'
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
  const { cartCount, projects, createProjectFromCart, approveProject } = useStore()
  const [mode, setMode] = useState('projects')

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
      {/* Шапка: слева заголовок, справа кнопка профиля (наш /profile) */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-[20px] font-black tracking-tight text-navy">Мой дом</h1>
          <Link
            to="/profile"
            aria-label="Профиль"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white shadow-soft hide-tap active:bg-bg"
          >
            <CircleUserRound className="h-5 w-5 text-navy" strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      {/* Сегмент-тумблер Проекты / Корзина */}
      <div className="px-4 pt-3">
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
                      Добавьте товары в корзину и соберите из них проект — здесь появятся
                      этапы работ и смета
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
          <p className="mt-1 text-[12px] text-muted">Своими силами • материалы ОМА</p>
          <p className="mt-1 text-[12.5px] text-muted">
            {project.items.length} поз. • материалы {rub(project.itemsTotal)}
          </p>
          <p className="mt-1.5 text-[15px] font-black text-navy">
            {rub(project.itemsTotal + project.crewTotal)}
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
    ;(acc[key] = acc[k