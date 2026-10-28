import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard.jsx'
import CityPicker from '../components/CityPicker.jsx'
import Logo from '../components/Logo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { ProductGridSkeleton, useSkeleton } from '../components/Skeleton.jsx'
import { DecorPacksRow } from '../components/DecorPacks.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { staggerChild, staggerParent } from '../components/ui.jsx'
import { categories, popularProducts, saleProducts } from '../lib/catalog'
import { cn } from '../lib/cn'
import { useStore } from '../store/StoreContext'

/** Порядок разделов: сначала ремонтные, как в приложении ОМА */
const ORDER = ['dekor', 'interier', 'stroymaterialy', 'instrument', 'santehnika', 'electrika', 'krepesh', 'blagoustroystvo', 'mebel', 'bytovaya-tehnika', 'tovary-dlya-doma']
const SECTIONS = [
  { id: 'akcii', name: 'Акции' },
  { id: 'paket-dekora', name: 'Пакеты декора', to: '/decor' },
  ...ORDER.map((id) => categories.find((c) => c.id === id)).filter(Boolean),
  ...categories.filter((c) => !ORDER.includes(c.id)),
]

const TABS = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
]

const BANNERS = [
  {
    title: 'Скидки до 60%',
    sub: 'на инструменты и светотехнику · до 01.11',
    ghost: '−60%',
    cls: 'from-navy via-[#254a75] to-[#31628f]',
    label: 'Горячие скидки',
  },
  {
    title: 'Всё для дома',
    sub: 'специальные цены этой недели на товары для дома',
    ghost: 'АКЦИИ',
    cls: 'from-[#1d3350] via-[#2a4568] to-[#3c5c82]',
    label: 'Спецпредложения',
  },
  {
    title: 'Электроинструмент',
    sub: 'MAKITA · BOSCH · DEWALT — хиты сезона',
    ghost: 'PRO',
    cls: 'from-[#16202b] via-[#243140] to-[#37485c]',
    label: 'Только топ-бренды',
  },
]

export default function Home() {
  const [bannerIdx, setBannerIdx] = useState(0)
  const [cityOpen, setCityOpen] = useState(false)
  const { city } = useStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tab = pathname === '/catalog' ? '/catalog' : '/'
  const loading = useSkeleton(650)

  /** Определяет ближайший баннер к левому краю — для точек-индикаторов */
  const onBannerScroll = (e) => {
    const el = e.currentTarget
    const kids = Array.from(el.children)
    if (!kids.length) return
    const first = kids[0].offsetLeft
    let best = 0
    let bestD = Infinity
    kids.forEach((k, i) => {
      const d = Math.abs(k.offsetLeft - first - el.scrollLeft)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    setBannerIdx(best)
  }

  return (
    <div>
      {/* Логотип и город */}
      <div className="flex items-center justify-between bg-white px-4 pt-3 pb-1">
        <Link to="/" aria-label="ОМА — на главную" className="flex items-center hide-tap">
          <Logo className="h-9 w-auto" />
        </Link>
        <button
          onClick={() => setCityOpen(true)}
          className="flex items-center gap-1 text-[14px] font-semibold text-navy hide-tap"
        >
          <MapPin className="h-4 w-4 text-brand-600" />
          {city}
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </div>

      {/* Поиск + вкладки «Главная / Каталог» — прилипают к верху */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="px-4 pt-2">
          <SearchBar />
        </div>
        <div className="flex px-4">
          {TABS.map((t) => {
            const active = tab === t.to
            return (
              <button
                key={t.to}
                onClick={() => !active && navigate(t.to)}
                className={cn(
                  'relative flex-1 py-3 text-[14px] font-bold transition-colors hide-tap',
                  active ? 'text-brand-600' : 'text-muted',
                )}
              >
                {t.label}
                {active && (
                  <motion.span
                    layoutId="home-tab"
                    className="absolute inset-x-6 bottom-0 h-[3px] rounded-full bg-brand-600"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {tab === '/catalog' ? (
          <motion.section
            key="catalog"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              variants={staggerParent}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 items-stretch gap-3 px-4 pt-4 pb-6"
            >
              {SECTIONS.map((c) => (
                <motion.div key={c.id} variants={staggerChild} className="h-full">
                  <CategoryCard section={c} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
      {/* Промо-баннеры — листаются, точки показывают позицию */}
      <section
        onScroll={onBannerScroll}
        className="no-scrollbar mt-4 flex snap-x snap-proximity scroll-px-4 gap-3 overflow-x-auto px-4"
      >
        {BANNERS.map((b) => (
          <Link
            key={b.title}
            to="/category/akcii"
            className={`relative h-28 min-w-[85%] snap-start overflow-hidden rounded-xl bg-gradient-to-r ${b.cls} flex flex-col justify-between p-4 text-white hide-tap`}
          >
            <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[56px] font-black tracking-tighter opacity-10 select-none">
              {b.ghost}
            </span>
            <span className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
              {b.label}
            </span>
            <div>
              <span className="block text-[18px] font-extrabold leading-5">{b.title}</span>
              <span className="mt-0.5 block text-[11px] text-white/75">{b.sub}</span>
            </div>
          </Link>
        ))}
      </section>
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {BANNERS.map((b, i) => (
          <span
            key={b.title}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === bannerIdx ? 'w-4 bg-brand-600' : 'w-1.5 bg-[#d5dae1]'
            }`}
          />
        ))}
      </div>

      {/* Пакеты декора */}
      <DecorPacksRow />

      {/* Популярные товары */}
      <section className="mt-7 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-navy">Популярные товары</h2>
          <Link to="/catalog" className="text-[12px] font-medium text-brand-600">
            Каталог
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 items-stretch gap-3"
        >
          {popularProducts()
            .slice(0, 8)
            .map((p) => (
              <motion.div key={p.id} variants={staggerChild} className="h-full">
                <ProductCard product={p} />
              </motion.div>
            ))}
        </motion.div>
        )}
      </section>

      {/* Акции */}
      {saleProducts().length > 0 && (
        <section className="mt-8 px-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-navy">Акции</h2>
            <Link to="/category/akcii" className="text-[12px] font-medium text-brand-600">
              Все акции
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex items-stretch gap-3 overflow-x-auto px-4">
            {saleProducts()
              .slice(0, 6)
              .map((p) => (
                <div key={p.id} className="w-[150px] shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
          </div>
        </section>
      )}

      <footer className="mt-10 pb-2 text-center text-[11px] text-muted">
        ОМА · всё для дома и ремонта
      </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{cityOpen && <CityPicker onClose={() => setCityOpen(false)} />}</AnimatePresence>
    </div>
  )
}
