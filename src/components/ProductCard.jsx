import { motion } from 'framer-motion'
import { Heart, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { discountPercent, rub } from '../lib/format'
import { useStore } from '../store/StoreContext'
import Stars from './Stars.jsx'

/**
 * Карточка товара в сетке: фиксированная высота у всех карточек,
 * кнопки на одном уровне за счёт mt-auto.
 * У товаров со скидкой — красная плашка со скидкой справа от цены.
 */
export default function ProductCard({ product }) {
  const { cart, addToCart, setQty, favorites, toggleFav } = useStore()
  const qty = cart[product.id] ?? 0
  const fav = favorites.includes(product.id)
  const off = product.oldPrice ? discountPercent(product.price, product.oldPrice) : 0

  return (
    <Link to={`/product/${product.id}`} className="block h-full hide-tap">
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 550, damping: 28 }}
        className="flex h-full flex-col"
      >
        <div className="relative">
          <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-panel">
            <span className="text-[42px] leading-none">{product.emoji}</span>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFav(product.id)
            }}
            aria-label="В избранное"
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm active:bg-[#f1f3f6]"
          >
            <Heart
              className={`h-4 w-4 ${fav ? 'text-price' : 'text-slate-400'}`}
              fill={fav ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>

        <p className="mt-2 min-h-[34px] text-[12.5px] leading-[17px] text-navy line-clamp-2">
          {product.name}
        </p>

        {/* Цена + плашка скидки справа */}
        <div className="mt-1 flex h-5 items-center gap-1.5">
          <span className={`text-[15px] font-extrabold ${off > 0 ? 'text-price' : 'text-navy'}`}>
            {rub(product.price)}
          </span>
          {off > 0 && (
            <span className="rounded bg-price px-1.5 py-[1px] text-[10px] font-bold leading-[14px] text-white">
              −{off}%
            </span>
          )}
          <span className="text-[11px] text-muted">/ {product.unit}</span>
        </div>

        <div className="mt-0.5 h-[16px]">
          <Stars rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-auto pt-2">
          {qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(product.id)
              }}
              className="h-9 w-full rounded-lg bg-brand-600 text-[13px] font-semibold text-white active:bg-brand-700"
            >
              В корзину
            </motion.button>
          ) : (
            <div className="flex h-9 w-full items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setQty(product.id, qty - 1)
                }}
                aria-label="Меньше"
                className="flex h-7 w-9 items-center justify-center rounded-md bg-brand-600 text-white active:bg-brand-700"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <motion.span
                key={qty}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                className="text-[13px] font-bold text-navy"
              >
                {qty}
              </motion.span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setQty(product.id, qty + 1)
                }}
                aria-label="Больше"
                className="flex h-7 w-9 items-center justify-center rounded-md bg-brand-600 text-white active:bg-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
