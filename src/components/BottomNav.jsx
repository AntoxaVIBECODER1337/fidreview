import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { CircleUserRound, HardHat, LayoutGrid, ShoppingBag } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { cn } from '../lib/cn'

/** Домик «Мой дом»: крыша + стены + окошко */
function HouseIcon({ className, strokeWidth }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9.2V20h13V9.2" />
      <rect x="9.9" y="12.6" width="4.2" height="3.6" rx="0.5" />
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
  if (pathname === '/' || is('/catalog', '/category', '/sections', '/product', '/search')) return 0
  if (is('/my-home')) return 1
  if (is('/crews')) return 2
  if (is('/cart', '/favorites', '/checkout', '/order-success')) return 3
  if (is('/profile', '/login', '/orders')) return 4
  return -1
}

/** Вкладки-«родственники» внутри одного экрана: переключаются без слайда страницы */
export const screenKey = (pathname) =>
  pathname === '/' || pathname === '/catalog' ? 'home' : pathname === '/favorites' ? '/cart' : pathname

/** Стеклянное плавающее меню с «пилюлей» активной вкладки (дизайн oma-ozon) */
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
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto w-full max-w-[430px] px-2">
        <div className="rounded-3xl border border-white/60 bg-white/70 shadow-glass backdrop-blur-xl">
          <ul className="flex items-stretch justify-between p-1">
            {TABS.map((t, i) => {
              const active = i === activeIdx
              const { Icon } = t
              return (
                <li key={t.to} className="min-w-0 flex-1">
                  <Link to={t.to} aria-label={t.label} className="block hide-tap">
                    <motion.span
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
                      className="relative flex h-[52px] flex-col items-center justify-center gap-1 rounded-2xl"
                    >
                      {active && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-2xl bg-brand-50"
                          transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        />
                      )}
                      <span className="relative z-10" {...(t.to === '/cart' ? { 'data-cart-target': '' } : {})}>
                        <Icon
                          className={cn(
                            'h-[21px] w-[21px] transition-colors duration-200',
                            active ? 'text-brand-600' : 'text-muted',
                          )}
                          strokeWidth={active ? 2.4 : 2}
                                                  />
                        {t.to === '/cart' && cartCount > 0 && (
                          <motion.span
                            key={`${cartCount}-${bumpKey}`}
                            initial={{ scale: 0.2 }}
                            animate={{ scale: [0.2, 1.45, 1] }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white"
                          >
                            {cartCount > 99 ? '99+' : cartCount}
                          </motion.span>
                        )}
                      </span>
                      <span
                        className={cn(
                          'relative z-10 max-w-full truncate text-[10.5px] leading-none transition-colors duration-200',
                          active ? 'font-bold text-brand-600' : 'font-medium text-muted',
                        )}
                      >
                        {t.label}
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
