import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { overlayRoot } from '../lib/overlay'

const MIN = 1
const MAX = 4
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/**
 * Полноэкранный просмотр фото товара с pinch-zoom:
 * два пальца — масштаб, один палец — сдвиг увеличенного фото,
 * двойной тап — 1× ↔ 2.5×, колёсико / тачпад — масштаб на компьютере.
 */
export default function ZoomViewer({ product, onClose }) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0 })
  const [gesture, setGesture] = useState(false)
  const pointers = useRef(new Map())
  const start = useRef(null)
  const lastTap = useRef(0)

  const set = (s, x, y) => {
    const ns = clamp(s, MIN, MAX)
    const lim = (ns - 1) * 160 // не даём утащить фото за край
    setT({ s: ns, x: ns === 1 ? 0 : clamp(x, -lim, lim), y: ns === 1 ? 0 : clamp(y, -lim, lim) })
  }

  const dist = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setGesture(true)
    if (pointers.current.size === 2) start.current = { d: dist(), ...t, mode: 'pinch' }
    else start.current = { px: e.clientX, py: e.clientY, ...t, mode: 'pan' }

    // двойной тап
    const now = Date.now()
    if (pointers.current.size === 1 && now - lastTap.current < 280) {
      t.s > 1.05 ? set(1, 0, 0) : set(2.5, 0, 0)
      lastTap.current = 0
    } else lastTap.current = now
  }

  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const st = start.current
    if (!st) return
    if (pointers.current.size === 2 && st.mode === 'pinch') {
      set((st.s * dist()) / st.d, st.x, st.y)
    } else if (pointers.current.size === 1 && st.mode === 'pan' && t.s > 1) {
      set(st.s, st.x + (e.clientX - st.px), st.y + (e.clientY - st.py))
    }
  }

  const onUp = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()]
      start.current = { px: p.x, py: p.y, ...t, mode: 'pan' }
    } else if (pointers.current.size === 0) {
      start.current = null
      setGesture(false)
    }
  }

  const onWheel = (e) => set(t.s * (1 - e.deltaY * 0.0025), t.x, t.y)

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] mx-auto flex max-w-[430px] flex-col bg-white"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <span className="line-clamp-1 px-2 text-[14px] font-semibold text-navy">{product.name}</span>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel active:bg-line"
        >
          <X size={18} className="text-navy" />
        </button>
      </div>

      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        className="relative flex flex-1 touch-none items-center justify-center overflow-clip select-none"
      >
        <div
          style={{
            transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`,
            transition: gesture ? 'none' : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="flex items-center justify-center will-change-transform"
        >
          {product.image ? (
            <img src={product.image} alt={product.name} draggable={false} className="max-h-[60dvh] max-w-full" />
          ) : (
            <span className="text-[180px] leading-none">{product.emoji}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => set(t.s - 0.5, t.x, t.y)}
          aria-label="Уменьшить"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-navy active:bg-line"
        >
          <Minus size={18} />
        </button>
        <span className="w-16 text-center text-[14px] font-bold text-navy">{t.s.toFixed(1)}×</span>
        <button
          onClick={() => set(t.s + 0.5, t.x, t.y)}
          aria-label="Увеличить"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-navy active:bg-line"
        >
          <Plus size={18} />
        </button>
      </div>
      <p className="-mt-3 pb-4 text-center text-[11.5px] text-muted">
        Сведите или разведите пальцы · двойной тап — увеличить
      </p>
    </motion.div>,
    overlayRoot(),
  )
}
