import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Plus, Search, X } from 'lucide-react'
import { searchProducts } from '../lib/catalog'
import { rub } from '../lib/format'
import { overlayRoot } from '../lib/overlay'
import ProductImage from './ProductImage.jsx'

/**
 * Маленькая модалка «Добавить в смету»: поиск по каталогу ОМА,
 * совпадения показаны строками как в самой смете — фото, название, цена.
 * Тап по строке добавляет товар в смету проекта; модалка остаётся
 * открытой, чтобы можно было добавить сразу несколько позиций.
 */
export default function AddItemModal({ onPick, onClose }) {
  const [query, setQuery] = useState('')
  const found = searchProducts(query).slice(0, 30)

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="relative flex max-h-[70dvh] w-full flex-col overflow-clip rounded-2xl bg-white shadow-lift"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-2">
          <h3 className="text-[15px] font-extrabold text-navy">Добавить в смету</h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel transition-colors active:bg-line"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="shrink-0 px-4 pb-2">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-3 focus-within:border-brand-600">
            <Search size={15} className="shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти товар ОМА…"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-navy outline-none placeholder:text-muted"
            />
          </div>
        </div>
        <div className="scroll-area flex-1 overflow-y-auto px-4 pb-4">
          {!query.trim() && (
            <p className="py-6 text-center text-[12.5px] text-muted">
              Введите название — например, «плитка» или «ламинат»
            </p>
          )}
          {query.trim() && found.length === 0 && (
            <p className="py-6 text-center text-[12.5px] text-muted">По запросу «{query}» ничего не нашлось</p>
          )}
          <div className="flex flex-col">
            {found.map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className="flex items-center justify-between gap-3 border-b border-line/70 py-2.5 text-left last:border-0 active:bg-panel"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <ProductImage product={p} size={16} rounded="rounded-md" className="h-8 w-8" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-semibold text-navy">{p.name}</span>
                    <span className="block text-[11px] text-muted">{p.brand}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[12.5px] font-bold text-navy">{rub(p.price)}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600">
                    <Plus size={15} className="text-white" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    overlayRoot(),
  )
}
