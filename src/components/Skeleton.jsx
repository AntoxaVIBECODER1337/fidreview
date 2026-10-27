import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Имитация загрузки данных для демо (данные локальные и появляются мгновенно —
 * скелетон показывает, как экран выглядит при реальной сети).
 * deps — при смене (например, категории) скелетон показывается снова.
 */
export function useSkeleton(ms = 550, deps = []) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return loading
}

export function Bone({ className }) {
  return <div className={cn('skeleton rounded-md', className)} />
}

/** Скелетон карточки товара — повторяет её сетку */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-hidden>
      <Bone className="h-36 rounded-xl" />
      <Bone className="mt-2 h-3.5 w-[92%]" />
      <Bone className="mt-1.5 h-3.5 w-[60%]" />
      <Bone className="mt-2.5 h-4 w-[45%]" />
      <Bone className="mt-2 h-3 w-[55%]" />
      <Bone className="mt-3 h-9 rounded-lg" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="status" aria-label="Загрузка товаров">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
