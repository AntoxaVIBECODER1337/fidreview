import { AnimatePresence, motion } from 'framer-motion'
import { ListChecks, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProduct } from '../lib/catalog'
import { useStore } from '../store/StoreContext'

/** Плавающая плашка «Сравнить (N)» над меню — на экранах каталога и товара */
export default function CompareBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { compare, clearCompare } = useStore()
  const where = pathname === '/' || ['/catalog', '/category', '/product', '/search'].some((p) => pathname.startsWith(p))
  const items = compare.map(getProduct).filter(Boolean)
  const show = where && items.length > 0

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="pointer-events-none fixed inset-x-0 bottom-[92px] z-30 flex justify-center"
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-navy py-1.5 pr-1.5 pl-2 text-white shadow-lift">
            <button onClick={() => navigate('/compare')} className="flex items-center gap-2 pr-2">
              <span className="flex -space-x-2">
                {items.map((p) => (
                  <span
                    key={p.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-navy bg-white text-[14px]"
                  >
                    {p.emoji}
                  </span>
                ))}
              </span>
              <ListChecks size={15} />
              <span className="text-[13px] font-bold">Сравнить ({items.length})</span>
            </button>
            <button
              onClick={clearCompare}
              aria-label="Очистить сравнение"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
