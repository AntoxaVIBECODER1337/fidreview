import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { overlayRoot } from '../lib/overlay'

/**
 * Нижняя шторка в стиле oma-ozon: затемнение, пружинный выезд,
 * закрытие свайпом вниз. Рендерится в body, чтобы не зависеть от
 * анимаций страницы. Оборачивать в <AnimatePresence>.
 */
export default function Sheet({ title, subtitle, onClose, children, footer, maxH = '90dvh' }) {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col justify-end overflow-clip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => info.offset.y > 110 && onClose()}
        style={{ maxHeight: `min(${maxH}, 94%)` }}
        className="relative flex flex-col rounded-t-3xl bg-white shadow-lift"
      >
        <div className="shrink-0 px-5 pt-3 pb-2">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
          {title && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[19px] leading-tight font-black text-navy">{title}</h2>
                {subtitle && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel transition-colors active:bg-line"
              >
                <X size={17} className="text-muted" />
              </button>
            </div>
          )}
        </div>
        <div className="scroll-area flex-1 overflow-y-auto px-4 pb-3">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-line bg-white px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>,
    overlayRoot(),
  )
}
