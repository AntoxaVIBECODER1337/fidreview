import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/StoreContext'

/**
 * Всплывающая плашка («добавлено в избранное» и т.п.).
 * Показывается сверху, чтобы не перекрывать нижние панели с кнопками.
 */
export default function Toast() {
  const { toast, showToast } = useStore()

  useEffect(() => {
    if (!toast || !toast.text) return undefined
    const t = setTimeout(() => showToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast, showToast])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+12px)] z-[65] flex justify-center px-6 text-center"
    >
      <AnimatePresence>
        {toast?.text && (
          <motion.div
            key={toast.id}
            initial={{ y: -16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            className="rounded-full bg-navy/92 px-4 py-2.5 text-[13px] text-white shadow-lift backdrop-blur"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
