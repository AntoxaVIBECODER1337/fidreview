import { Link } from 'react-router-dom'

/** Пустое состояние экрана: линейная иконка + заголовок + кнопка */
export default function EmptyState({ icon: Icon, title, subtitle, buttonLabel, to = '/' }) {
  return (
    <div className="flex flex-col items-center px-8 py-20 text-center">
      {Icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-panel">
          <Icon className="h-10 w-10 text-[#9aa5b5]" strokeWidth={1.5} />
        </div>
      )}
      <h2 className="mt-5 text-[17px] font-bold leading-6 text-navy">{title}</h2>
      {subtitle && <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-muted">{subtitle}</p>}
      {buttonLabel && (
        <Link
          to={to}
          className="mt-6 flex h-11 items-center rounded-lg bg-brand-600 px-6 text-[14px] font-semibold text-white active:bg-brand-700"
        >
          {buttonLabel}
        </Link>
      )}
    </div>
  )
}
