import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import { getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { PROMOS } from '../lib/promo'
import { useStore } from '../store/StoreContext'

export default function CartPage() {
  const { cart, setQty, removeFromCart, promo, applyPromo, clearPromo } = useStore()
  const [code, setCode] = useState('')

  const items = Object.entries(cart).flatMap(([id, qty]) => {
    const p = getProduct(id)
    return p ? [{ product: p, qty }] : []
  })
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const savings = items.reduce(
    (s, i) => s + (i.product.oldPrice ? i.product.oldPrice - i.product.price : 0) * i.qty,
    0,
  )
  const promoPct = promo ? PROMOS[promo] : 0
  const promoAmount = Math.round(subtotal * promoPct) / 100
  const total = subtotal - promoAmount

  return (
    <div>
      <Header title="Корзина" />

      {items.length === 0 ? (
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

          {/* Товары */}
          <section className="px-4 pt-3">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex gap-3 border-b border-line py-3 last:border-b-0"
              >
                <Link to={`/product/${product.id}`} className="hide-tap">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-panel text-4xl">
                    {product.emoji}
                  </div>
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
        </>
      )}
    </div>
  )
}
