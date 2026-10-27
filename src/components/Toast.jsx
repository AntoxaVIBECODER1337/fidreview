import { useEffect } from 'react'
import { useStore } from '../store/StoreContext'

/** Всплывающая плашка («добавлено в избранное» и т.п.) */
export default function Toast() {
  const { toast, showToast } = useStore()

  useEffect(() => {
    if (!toast || !toast.text) return undefined
    const t = setTimeout(() => showToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast, showToast])

  if (!toast || !toast.text) return null

  return (
    <div className="pointer-events-none fixed bottom-[148px] inset-x-0 z-50 flex justify-center px-6 text-center">
      <div className="rounded-full bg-navy/90 px-4 py-2.5 text-[13px] text-white shadow-lg">
        {toast.text}
      </div>
    </div>
  )
}
