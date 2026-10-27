import { ArrowLeft, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** Шапка внутренних экранов: заголовок по центру, назад слева, слот справа */
export default function Header({ title, back = false, right = null }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="relative flex h-14 items-center px-1">
        {back ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy hide-tap active:bg-bg"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
          </button>
        ) : (
          <span className="w-10" />
        )}
        <h1 className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-[16px] font-bold text-navy">
          {title}
        </h1>
        <div className="ml-auto flex items-center">{right}</div>
      </div>
    </header>
  )
}

/** Кнопка «поделиться» справа в шапке (демо) */
export function ShareButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Поделиться"
      className="flex h-10 w-10 items-center justify-center rounded-full text-navy hide-tap active:bg-bg"
    >
      <Share2 className="h-5 w-5" strokeWidth={2} />
    </button>
  )
}
