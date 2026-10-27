import { useState } from 'react'
import { motion } from 'framer-motion'
import { ListChecks, Plus, Star, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import { getCategory, getProduct } from '../lib/catalog'
import { cn } from '../lib/cn'
import { flyToCart } from '../lib/fly'
import { discountPercent, rub } from '../lib/format'
import { COMPARE_MAX, useStore } from '../store/StoreContext'

/** Сравнение товаров (до 4): таблица параметров, лучшие значения подсвечены */
export default function ComparePage() {
  const { compare, toggleCompare, clearCompare, addToCart, cart } = useStore()
  const [onlyDiff, setOnlyDiff] = useState(false)
  const items = compare.map(getProduct).filter(Boolean)

  if (items.length === 0) {
    return (
      <div>
        <Header back title="Сравнение" />
        <EmptyState
          icon={ListChecks}
          title="Список сравнения пуст"
          subtitle={`На странице товара нажмите «Добавить к сравнению» — можно сравнить до ${COMPARE_MAX} товаров`}
          buttonLabel="В каталог"
          to="/catalog"
        />
      </div>
    )
  }

  const minPrice = Math.min(...items.map((p) => p.price))
  const maxRating = Math.max(...items.map((p) => p.rating))

  /* Строки таблицы: базовые + все параметры из specs */
  const specNames = [...new Set(items.flatMap((p) => p.specs.map((s) => s.name)))]
  const rows = [
    { name: 'Рейтинг', get: (p) => p.rating, render: (p) => <Rating p={p} best={items.length > 1 && p.rating === maxRating} /> },
    { name: 'Отзывы', get: (p) => p.reviews },
    { name: 'Бренд', get: (p) => p.brand },
    { name: 'Раздел', get: (p) => getCategory(p.cat)?.name ?? '—' },
    { name: 'Подраздел', get: (p) => p.sub },
    { name: 'Единица', get: (p) => p.unit },
    { name: 'Скидка', get: (p) => (p.oldPrice ? `−${discountPercent(p.price, p.oldPrice)}%` : '—') },
    { name: 'В наличии', get: (p) => `${p.stock} ${p.unit}` },
    ...specNames.map((n) => ({ name: n, get: (p) => p.specs.find((s) => s.name === n)?.value ?? '—' })),
  ]
  const shown =
    onlyDiff && items.length > 1 ? rows.filter((r) => new Set(items.map((p) => String(r.get(p)))).size > 1) : rows

  const COL = 'w-[148px] shrink-0'

  return (
    <div>
      <Header
        back
        title="Сравнение"
        right={
          <button onClick={clearCompare} aria-label="Очистить" className="flex h-10 w-10 items-center justify-center text-muted">
            <Trash2 size={18} />
          </button>
        }
      />

      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-[12.5px] text-muted">
          {items.length} из {COMPARE_MAX} товаров
        </span>
        {items.length > 1 && (
          <button
            onClick={() => setOnlyDiff((v) => !v)}
            className="flex items-center gap-2 text-[12.5px] font-semibold text-navy"
          >
            <span
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                onlyDiff ? 'bg-brand-600' : 'bg-line',
              )}
            >
              <motion.span
                layout
                className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow', onlyDiff ? 'right-0.5' : 'left-0.5')}
              />
            </span>
            Только различия
          </button>
        )}
      </div>

      <div className="no-scrollbar mt-3 overflow-x-auto">
        <div className="w-max min-w-full">
          {/* Карточки товаров */}
          <div className="flex border-b border-line">
            <div className="sticky left-0 z-10 w-[104px] shrink-0 bg-white" />
            {items.map((p) => {
              const qty = cart[p.id] ?? 0
              const cheapest = items.length > 1 && p.price === minPrice
              return (
                <div key={p.id} className={cn(COL, 'relative px-2 pb-3')}>
                  <button
                    onClick={() => toggleCompare(p.id)}
                    aria-label="Убрать из сравнения"
                    className="absolute top-0 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-muted shadow-soft"
                  >
                    <X size={14} />
                  </button>
                  <Link to={`/product/${p.id}`} className="block hide-tap">
                    <div className="flex h-24 items-center justify-center rounded-xl bg-panel text-[44px]">{p.emoji}</div>
                    <p className="mt-2 line-clamp-3 min-h-[51px] text-[12px] leading-[17px] text-navy">{p.name}</p>
                  </Link>
                  <p
                    className={cn(
                      'mt-1 w-fit rounded-md px-1.5 py-0.5 text-[15px] font-black',
                      cheapest ? 'bg-emerald-50 text-emerald-700' : p.oldPrice ? 'text-price' : 'text-navy',
                    )}
                  >
                    {rub(p.price)}
                  </p>
                  {cheapest && <p className="text-[10.5px] font-bold text-emerald-700">Дешевле всех</p>}
                  <button
                    onClick={(e) => {
                      addToCart(p.id)
                      flyToCart(e.currentTarget, p.emoji)
                    }}
                    className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-brand-600 text-[12px] font-semibold text-white active:bg-brand-700"
                  >
                    {qty ? `В корзине: ${qty}` : (
                      <>
                        <Plus size={13} /> В корзину
                      </>
                    )}
                  </button>
                </div>
              )
            })}
            {items.length < COMPARE_MAX && (
              <Link
                to="/catalog"
                className={cn(COL, 'mx-2 mb-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-[12px] font-semibold text-muted')}
              >
                <Plus size={20} /> Добавить товар
              </Link>
            )}
          </div>

          {/* Параметры */}
          {shown.map((r, i) => (
            <div key={r.name} className={cn('flex', i % 2 ? 'bg-white' : 'bg-bg')}>
              <div
                className={cn(
                  'sticky left-0 z-10 w-[104px] shrink-0 py-2.5 pr-2 pl-4 text-[11.5px] leading-snug text-muted',
                  i % 2 ? 'bg-white' : 'bg-bg',
                )}
              >
                {r.name}
              </div>
              {items.map((p) => (
                <div key={p.id} className={cn(COL, 'px-2 py-2.5 text-[12.5px] leading-snug font-semibold text-navy')}>
                  {r.render ? r.render(p) : r.get(p)}
                </div>
              ))}
              {items.length < COMPARE_MAX && <div className={cn(COL, 'mx-2')} />}
            </div>
          ))}
          {shown.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-muted">Параметры у товаров совпадают</p>
          )}
        </div>
      </div>

      {items.length === 1 && (
        <p className="px-6 pt-4 text-center text-[12.5px] text-muted">
          Добавьте ещё товар со страницы товара, чтобы сравнить характеристики
        </p>
      )}
    </div>
  )
}

function Rating({ p, best }) {
  return (
    <span className={cn('inline-flex items-center gap-1', best && 'rounded-md bg-emerald-50 px-1.5 text-emerald-700')}>
      <Star size={12} className="text-accent" fill="currentColor" />
      {p.rating}
    </span>
  )
}
