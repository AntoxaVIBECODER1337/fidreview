import { Link, useLocation } from 'react-router-dom'
import { CircleUserRound, Heart, LayoutGrid, ListFilter, ShoppingBag } from 'lucide-react'
import { useStore } from '../store/StoreContext'

/** Домик «Мой дом»: крыша + стены + окошко */
function HouseIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${active ? 'text-accent' : 'text-[#3f4756]'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9.2V20h13V9.2" />
      <rect x="9.9" y="12.6" width="4.2" height="3.6" rx="0.5" />
    </svg>
  )
}

const TABS = [
  { to: '/', label: 'Главная', icon: 'grid' },
  { to: '/catalog', label: 'Каталог', icon: 'catalog' },
  { to: '/my-home', label: 'Мой дом', icon: 'house' },
  { to: '/cart', label: 'Корзина', icon: 'bag' },
  { to: '/favorites', label: 'Избранное', icon: 'heart' },
  { to: '/profile', label: 'Профиль', icon: 'user' },
]

function TabIcon({ name, active }) {
  const cls = `h-[22px] w-[22px] ${active ? 'text-accent' : 'text-[#3f4756]'}`
  const width = active ? 2.3 : 1.8
  if (name === 'house') return <HouseIcon active={active} />
  if (name === 'grid') return <LayoutGrid className={cls} strokeWidth={width} />
  if (name === 'catalog') return <ListFilter className={cls} strokeWidth={width} />
  if (name === 'bag') return <ShoppingBag className={cls} strokeWidth={width} />
  if (name === 'heart')
    return <Heart className={cls} strokeWidth={width} fill={active ? 'currentColor' : 'none'} />
  return <CircleUserRound className={cls} strokeWidth={width} />
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const { cartCount } = useStore()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto w-full max-w-[430px] border-t border-line bg-white">
        <ul className="flex items-stretch justify-between px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
          {TABS.map((t) => {
            const active = pathname === t.to
            return (
              <li key={t.to} className="flex-1 min-w-0">
                <Link
                  to={t.to}
                  className={`relative flex flex-col items-center gap-1 py-1 hide-tap ${
                    active ? 'text-accent' : 'text-[#3f4756]'
                  }`}
                >
                  <span className="relative">
                    <TabIcon name={t.icon} active={active} />
                    {t.to === '/cart' && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[9.5px] leading-none ${
                      active ? 'font-bold text-accent' : 'font-medium text-[#3f4756]'
                    }`}
                  >
                    {t.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
