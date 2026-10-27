import { useState } from 'react'
import { Heart, HelpCircle, ListPlus, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import Stars from '../components/Stars.jsx'
import { getProduct, products } from '../lib/catalog'
import { discountPercent, rub } from '../lib/format'
import { useStore } from '../store/StoreContext'

/** «Покупают вместе с этим» — подборка из других категорий */
function buyWith(product) {
  const others = products.filter((p) => p.cat !== product.cat)
  const picked = []
  const step = Math.max(1, Math.floor(others.length / 4))
  for (let i = 0; i < others.length && picked.length < 4; i += step) picked.push(others[i])
  return picked
}

export default function ProductPage() {
  const { id } = useParams()
  const product = getProduct(id)
  const { cart, addToCart, favorites, toggleFav, showToast } = useStore()
  const [tab, setTab] = useState('desc')
  const [expanded, setExpanded] = useState(false)

  if (!product) {
    return (
      <div>
        <Header back title="Товар" />
        <EmptyState
          icon={HelpCircle}
          title="Товар не найден"
          buttonLabel="На главную"
          to="/"
        />
      </div>
    )
  }

  const inCart = cart[product.id] ?? 0
  const fav = favorites.includes(product.id)
  const off = product.oldPrice ? discountPercent(product.price, product.oldPrice) : 0
  const withItems = buyWith(product)
  const longText = product.desc.length > 140

  return (
    <div>
      <Header back title={product.name} />

      {/* Галерея */}
      <div className="relative flex h-64 items-center justify-center bg-white">
        <span className="text-[110px] leading-none">{product.emoji}</span>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div className="px-4 pt-2">
        <p className="text-[11px] text-muted">Арт. {product.sku}</p>
        <div className="mt-1.5">
          <Stars rating={product.rating} reviews={product.reviews} big />
        </div>
        <h2 className="mt-2 text-[16px] font-medium leading-6 text-navy">{product.name}</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[24px] font-black ${off > 0 ? 'text-price' : 'text-navy'}`}>
            {rub(product.price)}
          </span>
          {off > 0 && (
            <span className="rounded bg-price px-2 py-[3px] text-[12px] font-bold text-white">
              −{off}%
            </span>
          )}
          <span className="text-[12px] text-muted">/ {product.unit}</span>
          {product.oldPrice && (
            <span className="text-[13px] text-muted line-through">{rub(product.oldPrice)}</span>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => toggleFav(product.id)}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white hide-tap ${
              fav ? 'bg-accent active:bg-accent-dark' : 'bg-accent/90 active:bg-accent-dark'
            }`}
          >
            <Heart className="h-5 w-5" fill="currentColor" />
            {fav ? 'В избранном' : 'В избранное'}
          </button>
          {inCart === 0 ? (
            <button
              onClick={() => addToCart(product.id, 1)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 text-[14px] font-semibold text-white hide-tap active:bg-brand-700"
            >
              <ShoppingBag className="h-5 w-5" />
              В корзину
            </button>
          ) : (
            /* Уже в корзине — вместо кнопки счётчик с «−» и «+» */
            <div className="flex h-12 flex-1 items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-1.5">
              <button
                onClick={() => addToCart(product.id, -1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white active:bg-brand-700"
                aria-label="Убрать одну"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-bold text-navy">{inCart}</span>
              <button
                onClick={() => addToCart(product.id, 1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white active:bg-brand-700"
                aria-label="Добавить ещё"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => showToast('Список сравнения — в следующей версии')}
          className="mt-3 flex items-center gap-2 text-[13px] font-medium text-navy hide-tap"
        >
          <ListPlus className="h-5 w-5 text-[#243044]" strokeWidth={1.7} />
          Добавить к сравнению
        </button>
      </div>

      {/* Табы: Описание / Параметры */}
      <section className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-panel p-1">
          {[
            ['desc', 'Описание'],
            ['specs', 'Параметры'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`h-10 rounded-lg text-[14px] font-semibold hide-tap ${
                tab === key ? 'bg-white text-navy shadow-sm' : 'text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'desc' ? (
          <div className="pt-3">
            <p
              className={`text-[13px] leading-5 text-[#2b3a4d] ${
                longText && !expanded ? 'line-clamp-4' : ''
              }`}
            >
              {product.desc}
              {'\n\n'}
              Изготовитель: {product.brand} · Страна производства: Беларусь
              {'\n'}Гарантийный срок: по ГОСТ
            </p>
            {longText && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-[13px] font-semibold text-brand-600 hide-tap"
              >
                {expanded ? 'Свернуть' : 'Ещё'}
              </button>
            )}
          </div>
        ) : (
          <dl className="pt-2">
            {product.specs.map((s) => (
              <div key={s.name} className="flex justify-between border-b border-line py-2.5 text-[13px] last:border-b-0">
                <dt className="text-muted">{s.name}</dt>
                <dd className="font-semibold text-navy">{s.value}</dd>
              </div>
            ))}
            <div className="flex justify-between border-b border-line py-2.5 text-[13px]">
              <dt className="text-muted">Наличие</dt>
              <dd className="font-semibold text-navy">{product.stock} шт</dd>
            </div>
          </dl>
        )}
      </section>

      {/* Покупают вместе с этим */}
      {withItems.length > 0 && (
        <section className="mt-7">
          <div className="px-4">
            <h3 className="text-[16px] font-bold text-navy">Покупают вместе с этим</h3>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
            {withItems.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="w-[110px] shrink-0 hide-tap">
                <div className="flex h-24 items-center justify-center rounded-xl bg-panel text-[40px]">
                  {p.emoji}
                </div>
                <p className="mt-1.5 text-[13px] font-bold text-navy">{rub(p.price)}</p>
                <p className="line-clamp-2 text-[11px] leading-4 text-muted">{p.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
