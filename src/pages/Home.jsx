import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Blocks, ChevronDown, Droplet, Lamp, Lightbulb, MapPin, Nut, Sprout, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import CityPicker from '../components/CityPicker.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { staggerChild, staggerParent } from '../components/ui.jsx'
import { popularProducts, saleProducts } from '../lib/catalog'
import { useStore } from '../store/StoreContext'

const CHIPS = [
  { label: 'Шуруповёрты', to: '/category/instrument', Icon: Wrench },
  { label: 'Смесители', to: '/category/santehnika', Icon: Droplet },
  { label: 'Стройматериалы', to: '/category/stroymaterialy', Icon: Blocks },
  { label: 'Освещение', to: '/category/electrika?sub=Светильники', Icon: Lamp },
  { label: 'Электрика', to: '/category/electrika', Icon: Lightbulb },
  { label: 'Крепёж', to: '/category/krepesh', Icon: Nut },
  { label: 'Сад', to: '/category/blagoustroystvo', Icon: Sprout },
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
      {/* Шапка */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <Link to="/" className="flex items-center gap-2 hide-tap">
            <span className="text-[22px] font-black tracking-wide text-brand-600">ОМА</span>
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
        <div className="px-4 pb-3">
          <SearchBar />
        </div>
      </header>

      {/* Быстрые категории — листаются вправо */}
      <section className="relative mt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {CHIPS.map(({ label, to, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-navy hide-tap active:border-brand-300"
            >
              <Icon className="h-4 w-4 text-brand-600" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </div>
        {/* Мягкая подсказка, что справа ещё есть чипсы */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-7 bg-gradient-to-l from-white via-white/80 to-transparent" />
      </section>

      {/* Промо-баннеры — листаются, точки показывают позицию */}
      <section
        onScroll={onBannerScroll}
        className="no-scrollbar mt-4 flex snap-x snap-proximity gap-3 overflow-x-auto px-4"
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

      {/* Популярные товары */}
      <section className="mt-7 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-navy">Популярные товары</h2>
          <Link to="/catalog" className="text-[12px] font-medium text-brand-600">
            Все
          </Link>
        </div>
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

      <AnimatePresence>{cityOpen && <CityPicker onClose={() => setCityOpen(false)} />}</AnimatePresence>

      <footer className="mt-10 pb-2 text-center text-[11px] text-muted">
        ОМА · всё для дома и ремонта · MVP для хакатона
      </footer>
    </div>
  )
}
