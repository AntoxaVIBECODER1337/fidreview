import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { CircleUserRound, HardHat, LayoutGrid, ShoppingBag } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { cn } from '../lib/cn'

/** Домик «Мой дом» — один в один с фото (залитый силуэт):
 *  широкая крыша-полоса с зазором, корпус со сводчатой дверью-выемкой.
 *  Цвет наследуется: в активной вкладке — наш brand-600, в неактивной — серый. */
function HouseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none" aria-hidden>
      {/* Шире обычного: растяжение по горизонтали от центра */}
      <g transform="translate(12 0) scale(1.07 1) translate(-12 0)">
        {/* Крыша: полоса с вертикальными срезами по концам */}
        <path d="M12 3.2 4 10.4 4 12.8 12 5.6 20 12.8 20 10.4Z" />
        {/* Корпус с арочной дверью-выемкой (evenodd = дырка) */}
        <path
          fillRule="evenodd"
          d="M6.6 11.86 12 7l5.4 4.86V21H6.6Z M9.85 21v-3.6a2.15 2.15 0 1 1 4.3 0V21Z"
        />
      </g>
    </svg>
  )
}

export const TABS = [
  { to: '/', label: 'Главная', Icon: LayoutGrid },
  { to: '/my-home', label: 'Мой дом', Icon: HouseIcon },
  { to: '/crews', label: 'Бригады', Icon: HardHat },
  { to: '/cart', label: 'Корзина', Icon: ShoppingBag },
  { to: '/profile', label: 'Профиль', Icon: CircleUserRound },
]

/** К какой вкладке относится путь (для подсветки и направления анимации) */
export function tabIndexFor(pathname) {
  const is = (...ps) => ps.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (pathname === '/' || is('/catalog', '/category', '/sections', '/product', '/search', '/decor')) return 0
  if (is('/my-home')) return 1
  if (is('/crews')) return 2
  if (is('/cart', '/favorites', '/checkout', '/order-success')) return 3
  if (is('/profile', '/login', '/orders')) return 4
  return -1
}

/** Вкладки-«родственники» внутри одного экрана: переключаются без слайда страницы */
export const screenKey = (pathname) =>
  pathname === '/' || pathname === '/catalog' ? 'home' : pathname === '/favorites' ? '/cart' : pathname

/** Меню, прижатое к низу экрана: прямая линия сверху от угла до угла, без отступов по бокам и снизу */
export default function BottomNav() {
  const { pathname } = useLocation()
  const { cartCount } = useStore()
  const activeIdx = tabIndexFor(pathname)
  /* «Поп» бейджа корзины, когда товар долетел до иконки */
  const [bumpKey, setBumpKey] = useState(0)
  useEffect(() => {
    const f = () => setBumpKey((k) => k + 1)
    window.addEventListener('cart:bump', f)
    return () => window.removeEventListener('cart:bump', f)
  }, [])

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto w-full max-w-[430px]">
        <div className="border-t border-black/[0.08] bg-white/80 backdrop-blur-xl">
          <ul
            className="flex items-stretch justify-between px-1 pt-1"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          >
            {TABS.map((t, i) => {
              const active = i === activeIdx
              const { Icon } = t
              return (
                <li key={t.to} className="min-w-0 flex-1">
                  <Link to={t.to} aria-label={t.label} className="block hide-tap">
                    <motion.span
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
                      className="relative flex h-[52px] items-center justify-center rounded-2xl"
                    >
                      <span className="relative z-10" {...(t.to === '/cart' ? { 'data-cart-target': '' } : {})}>
                        <Icon
                          className={cn(
                            'h-[24px] w-[24px] transition-colors duration-200',
                            active ? 'text-brand-600' : 'text-muted',
                          )}
                          strokeWidth={active ? 2.4 :1.9}
                        />
                        {t.to === '/cart' && cartCount > 0 && (
                          <motion.span
                            key={`${cartCount}-${bumpKey}`}
                            initial={{ scale: 0.2 }}
                            animate={{ scale: [0.2, 1.45, 1] }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="absolute -top-2 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white"
                          >
                            {cartCount > 99 ? '99+' : cartCount}
                          </motion.span>
                        )}
                      </span>
                    </motion.span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
