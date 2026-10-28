import { forwardRef, useEffect, useState } from 'react'
import { Wifi } from 'lucide-react'

/**
 * Показывать ли рамку телефона: на компьютере (широкий экран + мышь).
 * На настоящем телефоне приложение во весь экран, без рамки.
 * ?frame=0 — выключить рамку, ?frame=1 — включить принудительно.
 */
export function usePhoneFrame() {
  const query = '(min-width: 700px) and (min-height: 720px) and (hover: hover)'
  const force = new URLSearchParams(location.search).get('frame')
  const [on, setOn] = useState(() => (force ? force === '1' : matchMedia(query).matches))
  useEffect(() => {
    if (force) return undefined
    const mq = matchMedia(query)
    const f = () => setOn(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [force])
  return on
}

/** Статус-бар iPhone: время, связь, Wi-Fi, батарея, «островок» */
function StatusBar() {
  const fmt = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative flex h-[50px] shrink-0 items-center justify-between bg-white px-8 pt-1.5 text-navy">
      <span className="w-14 text-[15px] font-semibold tracking-tight">{time}</span>
      {/* Dynamic Island */}
      <span className="absolute top-[11px] left-1/2 h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex w-14 items-center justify-end gap-1.5">
        {/* Связь */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <Wifi size={15} strokeWidth={2.6} />
        {/* Батарея */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor" />
          <path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4z" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

/**
 * Рамка телефона для показа на компьютере. Всё «фиксированное» внутри
 * (меню, тосты, шторки) позиционируется относительно экрана телефона
 * благодаря transform на области экрана.
 */
export const PhoneFrame = forwardRef(function PhoneFrame({ children, overlay }, scrollRef) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_top,#1b2f4f_0%,#0c1524_60%)] p-6">
      <div className="relative h-[min(868px,calc(100dvh-48px))] w-[414px] shrink-0 rounded-[62px] bg-[#0b0f17] p-3 shadow-[0_40px_100px_rgb(0_0_0/0.55),inset_0_0_0_2px_#2a3242]">
        {/* Кнопки корпуса */}
        <span className="absolute top-[120px] -left-[3px] h-8 w-[3px] rounded-l bg-[#2a3242]" />
        <span className="absolute top-[180px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a3242]" />
        <span className="absolute top-[250px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a3242]" />
        <span className="absolute top-[200px] -right-[3px] h-20 w-[3px] rounded-r bg-[#2a3242]" />

        <div className="flex h-full w-full flex-col overflow-clip rounded-[50px] bg-white">
          <StatusBar />
          {/* Экран: transform делает его «окном» для fixed-элементов.
              Отрицательный margin растягивает окно на полосу «домой» —
              стекло меню доходит до самого края экрана, без белой полосы */}
          <div className="relative -mb-[22px] flex-1 overflow-clip" style={{ transform: 'translateZ(0)' }}>
            <div ref={scrollRef} className="no-scrollbar absolute inset-0 overflow-x-clip overflow-y-auto">
              {children}
            </div>
            {overlay}
          </div>
          {/* Полоска «домой»: прозрачная (под ней стекло меню), «домик» поверх стекла */}
          <div className="pointer-events-none relative z-50 flex h-[22px] shrink-0 items-center justify-center">
            <span className="h-[5px] w-[134px] rounded-full bg-navy/85" />
          </div>
        </div>
      </div>
    </div>
  )
})
