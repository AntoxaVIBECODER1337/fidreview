import { useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Картинка товара: фото из public/img/… (поле image), а если файла нет —
 * эмодзи товара на нейтральной плашке. size — размер эмодзи-фолбэка в px.
 */
export default function ProductImage({ product, className, size = 24, rounded = 'rounded-lg' }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={cn('relative flex shrink-0 items-center justify-center overflow-hidden bg-panel', rounded, className)}>
      {failed || !product.image ? (
        <span style={{ fontSize: size }} className="leading-none">
          {product.emoji}
        </span>
      ) : (
        <img
          src={product.image}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  )
}
