import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hammer, Heart, Minus, PartyPopper, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductImage from '../components/ProductImage.jsx'
import { Tap, staggerChild, staggerParent } from '../components/ui.jsx'
import { cn } from '../lib/cn'
import { bundlePrice, getPack } from '../lib/decor'
import { getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { PROMOS } from '../lib/promo'
import { FREE_DELIVERY_FROM, useStore } from '../store/StoreContext'

/** «Корзина» с разделом «Избранное» (бывшая отдельная вкладка) */
export default function CartPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { cartCount, favorites } = useStore()
  const tab = pathname === '/favorites' ? 'fav' : 'cart'

  const TABS = [
    { id: 'cart', to: '/cart', label: 'Корзина', count: cartCount },
    { id: 'fav', to: '/favorites', label: 'Избранное', count: favorites.length },
  ]

  return (
    <div>
      <Header title={tab === 'fav' ? 'Избранное' : 'Корзина'} />

      <div className="px-4 pt-3">
        <div className="relative flex rounded-xl bg-panel p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => tab !== t.id && navigate(t.to, { replace: true })}
              className={cn(
                'relative flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors hide-tap',
                tab === t.id ? 'text-white' : 'text-muted',
              )}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="cart-toggle"
                  className="absolute inset-0 rounded-lg bg-brand-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {t.id === 'fav' && <Heart size={14} fill={tab === 'fav' ? 'currentColor' : 'none'} />}
                {t.label}
                {t.count > 0 && (
                  <motion.span
                    key={t.count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                    className={cn(
                      'flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-black',
                      tab === t.id ? 'bg-white text-brand-600' : 'bg-accent text-white',
                    )}
                  >
                    {t.count > 99 ? '99+' : t.count}
                  </motion.span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'fav' ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === 'fav' ? 16 : -16 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'fav' ? <FavoritesView /> : <CartView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function FavoritesView() {
  const { favorites } = useStore()
  const items = favorites.map(getProduct).filter(Boolean)
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="У вас нет избранных товаров"
        subtitle="Нажмите на ♡ на карточке товара, чтобы вернуться к нему позже"
        buttonLabel="В каталог"
        to="/catalog"
      />
    )
  }
  return (
    <motion.section
      variants={staggerParent}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 items-stretch gap-3 px-4 pt-4 pb-6"
    >
      {items.map((p) => (
        <motion.div key={p.id} variants={staggerChild} className="h-full">
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.section>
  )
}

function CartView() {
  const navigate = useNavigate()
  const { cart, setQty, removeFromCart, promo, applyPromo, clearPromo, createProjectFromCart, bundles, removeBundle } =
    useStore()
  const [code, setCode] = useState('')

  const items = Object.entries(cart).flatMap(([id, qty]) => {
    const p = getProduct(id)
    return p ? [{ product: p, qty }] : []
  })
  const bundlesTotal = bundles.reduce((s, b) => s + bundlePrice(b), 0)
  const subtotal = Math.round((items.reduce((s, i) => s + i.product.price * i.qty, 0) + bundlesTotal) * 100) / 100
  const savings = items.reduce(
    (s, i) => s + (i.product.oldPrice ? i.product.oldPrice - i.product.price : 0) * i.qty,
    0,
  )
  const promoPct = promo ? PROMOS[promo] : 0
  const promoAmount = Math.round(subtotal * promoPct) / 100
  const total = Math.round((subtotal - promoAmount) * 100) / 100

  const toProject = () => {
    const p = createProjectFromCart()
    if (p) navigate('/my-home')
  }

  return (
    <div>
      {items.length === 0 && bundles.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="В вашей корзине пусто"
          subtitle="Начните с просмотра каталога товаров, и вы обязательно найдёте то, что нужно"
          buttonLabel="Вернуться к покупкам"
          to="/catalog"
        />
      ) : (
        <>
          {/* Промокод */}
          <section className="flex gap-2 px-4 pt-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Промокод"
              className="h-10 flex-1 rounded-lg bg-panel px-3 text-[14px] text-navy placeholder:text-muted"
            />
            <button
              onClick={() => {
                if (applyPromo(code)) setCode('')
              }}
              className="h-10 rounded-lg bg-brand-600 px-4 text-[14px] font-semibold text-white hide-tap active:bg-brand-700"
            >
              Применить
            </button>
          </section>
          {promo && (
            <div className="mx-4 mt-2 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-[13px]">
              <span className="font-medium text-brand-700">
                Промокод {promo} · −{promoPct}%
              </span>
              <button onClick={clearPromo} aria-label="Убрать промокод" className="text-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <FreeDelivery subtotal={subtotal} />

          {/* Пакеты декора */}
          {bundles.length > 0 && (
            <section className="flex flex-col gap-2 px-4 pt-3">
              <AnimatePresence initial={false}>
                {bundles.map((b) => (
                  <BundleCard key={b.id} bundle={b} onRemove={() => removeBundle(b.id)} />
                ))}
              </AnimatePresence>
            </section>
          )}

          {/* Товары */}
          <section className="px-4 pt-3">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex gap-3 border-b border-line py-3 last:border-b-0"
              >
                <Link to={`/product/${product.id}`} className="hide-tap">
                  <ProductImage product={product} size={36} className="h-20 w-20" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] leading-4 text-navy">{product.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    {product.oldPrice && (
                      <span className="text-[11px] text-muted line-through">
                        {rub(product.oldPrice)}
                      </span>
                    )}
                    <span
                      className={`text-[14px] font-extrabold ${
                        product.oldPrice ? 'text-price' : 'text-navy'
                      }`}
                    >
                      {rub(product.price)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-8 items-center overflow-hidden rounded-md border border-brand-200 bg-brand-50">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="flex h-8 w-8 items-center justify-center bg-brand-600 text-white active:bg-brand-700"
                        aria-label="Меньше"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 bg-white text-center text-[13px] font-bold text-navy">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="flex h-8 w-8 items-center justify-center bg-brand-600 text-white active:bg-brand-700"
                        aria-label="Больше"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      aria-label="Удалить"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted hide-tap active:bg-panel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Итог */}
          <section className="mx-4 mt-4 rounded-xl bg-navy p-4 text-white">
            <div className="flex justify-between text-[13px]">
              <span className="text-white/80">Скидка:</span>
              <span>{rub(savings)}</span>
            </div>
            {promo && (
              <div className="mt-1 flex justify-between text-[13px]">
                <span className="text-white/80">Промокод {promo}:</span>
                <span>−{rub(promoAmount)}</span>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[15px] font-bold">Итого:</span>
              <span className="text-[20px] font-black">{rub(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-brand-600 text-[15px] font-semibold text-white hide-tap active:bg-brand-700"
            >
              Перейти к оформлению
            </Link>
          </section>
          <div className="mx-4 mt-2">
            <Tap
              onClick={toProject}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-brand-600/40 bg-white text-[13.5px] font-bold text-brand-600 transition-colors active:bg-brand-50"
            >
              <Hammer size={15} /> Сделать проект ремонта из корзины
            </Tap>
            <p className="mt-1.5 px-2 text-center text-[11px] text-muted">
              Проект появится в «Моём доме» — там можно выбрать бригаду
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/** «Осталось до бесплатной доставки» — прогресс по сумме корзины */
function FreeDelivery({ subtotal }) {
  const left = Math.max(0, Math.round((FREE_DELIVERY_FROM - subtotal) * 100) / 100)
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)
  const done = left === 0
  return (
    <section className="mx-4 mt-3 rounded-xl border border-line bg-white p-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
            done ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600',
          )}
        >
          {done ? <PartyPopper size={16} /> : <Truck size={16} />}
        </span>
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-navy">
          {done ? (
            <b className="text-emerald-700">Доставка бесплатно!</b>
          ) : (
            <>
              Ещё <b>{rub(left)}</b> до бесплатной доставки
            </>
          )}
          <span className="block text-[11px] text-muted">
            {done ? `Заказ от ${rub(FREE_DELIVERY_FROM)} — доставим завтра без оплаты` : `Доставка 5.90 р. · бесплатно от ${rub(FREE_DELIVERY_FROM)}`}
          </span>
        </p>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn('h-full rounded-full', done ? 'bg-emerald-500' : 'bg-brand-600')}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        />
      </div>
    </section>
  )
}

/** Пакет декора в корзине: состав, цена, «убрать» и «изменить» */
function BundleCard({ bundle, onRemove }) {
  const [open, setOpen] = useState(false)
  const pack = getPack(bundle.packId)
  const lines = bundle.items.map((i) => ({ ...i, product: getProduct(i.id) })).filter((l) => l.product)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-clip rounded-xl border border-line bg-white"
    >
      <div className="flex items-center gap-3 p-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[28px]"
          style={pack ? { background: `linear-gradient(150deg, ${pack.from}, ${pack.to})` } : undefined}
        >
          {bundle.emoji}
        </span>
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <span className="block text-[11px] font-bold tracking-wide text-brand-600 uppercase">Пакет декора</span>
          <span className="block truncate text-[14px] font-extrabold text-navy">«{bundle.title}»</span>
          <span className="block text-[12px] text-muted">
            {lines.length}
            {pack ? ` из ${pack.slots.length}` : ''} позиций · {open ? 'скрыть' : 'состав'}
          </span>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[15px] font-black text-navy">{rub(bundlePrice(bundle))}</span>
          <button onClick={onRemove} aria-label="Убрать пакет" className="flex h-7 w-7 items-center justify-center rounded-md text-muted active:bg-panel">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-clip border-t border-line px-3 py-1.5"
          >
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-2 py-1.5 text-[12.5px]">
                <ProductImage product={l.product} size={14} rounded="rounded-md" className="h-7 w-7" />
                <span className="min-w-0 flex-1 truncate text-navy">{l.product.name}</span>
                <span className="shrink-0 font-semibold text-muted">{rub(l.product.price)}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
