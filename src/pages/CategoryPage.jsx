import { useEffect, useMemo, useState } from 'react'
import { HelpCircle, PackageX } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { ProductGridSkeleton, useSkeleton } from '../components/Skeleton.jsx'
import { getCategory, productsByCategory, saleProducts } from '../lib/catalog'
import { countProducts } from '../lib/format'

export default function CategoryPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [sub, setSub] = useState(searchParams.get('sub') || 'Все')
  const [sort, setSort] = useState('popular')

  // Чипс с главной может открывать категорию сразу с подкатегорией: ?sub=Светильники
  useEffect(() => {
    setSub(searchParams.get('sub') || 'Все')
  }, [searchParams])

  const isAkcii = id === 'akcii'
  const loading = useSkeleton(600, [id, sub, sort])
  const cat = getCategory(id)

  const list = useMemo(() => {
    const base = isAkcii ? saleProducts() : productsByCategory(id)
    const filtered = sub === 'Все' ? base : base.filter((p) => p.sub === sub)
    if (sort === 'cheap') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'expensive') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [id, sub, sort, isAkcii])

  if (!cat && !isAkcii) {
    return (
      <div>
        <Header back title="Каталог" />
        <EmptyState
          icon={HelpCircle}
          title="Категория не найдена"
          subtitle="Возможно, раздел был перемещён"
          buttonLabel="В каталог"
          to="/catalog"
        />
      </div>
    )
  }

  return (
    <div>
      <Header back title={cat?.name || 'Акции'} />

      {!isAkcii && cat.subcategories.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-3">
          {['Все', ...cat.subcategories].map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium hide-tap ${
                sub === s
                  ? 'border-accent bg-accent-soft text-accent-dark'
                  : 'border-line text-[#3f4756]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-[12px] text-muted">{countProducts(list.length)}</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-lg border border-line bg-white px-2.5 text-[12px] font-medium text-navy"
        >
          <option value="popular">По популярности</option>
          <option value="cheap">Сначала дешевле</option>
          <option value="expensive">Сначала дороже</option>
        </select>
      </div>

      {loading ? (
        <div className="px-4 pt-3 pb-6">
          <ProductGridSkeleton count={6} />
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 px-4 pt-3 pb-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}

      {!loading && list.length === 0 && (
        <EmptyState
          icon={PackageX}
          title="Товаров пока нет"
          subtitle="Мы уже работаем над этим разделом"
          buttonLabel="В каталог"
          to="/catalog"
        />
      )}
    </div>
  )
}
