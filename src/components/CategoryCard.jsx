import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCatIcon } from '../lib/categoryIcons'

/**
 * Карточка раздела каталога: белая плитка, название слева сверху,
 * справа внизу — картинка раздела (поле `image` в categories.json).
 * Если картинки нет или она не загрузилась — линейная иконка-фолбэк.
 *
 * @param {{ id: string, name: string, image?: string }} section
 */
export default function CategoryCard({ section }) {
  const { id, name, image } = section
  const [imgFailed, setImgFailed] = useState(false)
  const Icon = getCatIcon(id)
  const showImage = image && !imgFailed

  return (
    <Link to={`/category/${id}`} className="h-full hide-tap">
      <div className="relative flex h-full min-h-40 flex-col rounded-xl border border-line bg-white p-4 shadow-sm active:border-brand-300">
        <span className="max-w-[62%] text-[15px] font-bold leading-tight text-navy">{name}</span>

        {showImage ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute bottom-3 right-3 h-20 w-24 object-contain"
          />
        ) : (
          <Icon
            className="absolute bottom-4 right-4 h-11 w-11 text-[#243044]"
            strokeWidth={1.4}
          />
        )}
      </div>
    </Link>
  )
}
