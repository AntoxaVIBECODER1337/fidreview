import { ScanLine, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

/** Поисковая строка: на вкладках — клик уводит на /search, на поиске — рабочий инпут */
export default function SearchBar({ readOnly = true, autoFocus = false, value = '', onChange }) {
  const navigate = useNavigate()
  const { showToast } = useStore()
  return (
    <div className="flex h-11 items-center gap-2 rounded-lg bg-panel px-3.5">
      <Search className="h-[18px] w-[18px] shrink-0 text-muted" />
      {readOnly ? (
        <button
          onClick={() => navigate('/search')}
          className="flex-1 text-left text-[14px] text-muted hide-tap"
        >
          Поиск по названию или каталогу
        </button>
      ) : (
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Поиск по названию или каталогу"
          className="flex-1 bg-transparent text-[14px] text-navy placeholder:text-muted"
        />
      )}
      <button
        onClick={() => showToast('Камера не работает — сканирование недоступно')}
        aria-label="Сканер"
        title="Сканер"
        className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 transition-colors active:text-slate-600 hide-tap"
      >
        <ScanLine className="h-5 w-5" />
      </button>
    </div>
  )
}
