import { useState } from 'react'
import { ArrowLeft, SearchX } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { searchProducts } from '../lib/catalog'

const POPULAR = ['ламинат', 'OSB', 'смеситель', 'шуруповёрт', 'лампа', 'утеплитель', 'ковёр']

export default function SearchPage() {
  const [q, setQ] = useState('')
  const results = searchProducts(q)

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex items-center gap-2 px-2 pb-3 pt-1">
          <button
            onClick={() => history.back()}
            className="flex h-11 w-9 items-center justify-center text-navy hide-tap"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
          </button>
          <div className="flex-1">
            <SearchBar readOnly={false} autoFocus value={q} onChange={setQ} />
          </div>
        </div>
      </header>

      {!q.trim() && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-navy">Популярные запросы</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR.map((s) => (
              <button
                key={s}
                onClick={() => setQ(s)}
                className="h-9 rounded-full border border-line px-3.5 text-[13px] text-[#3f4756] hide-tap active:border-brand-300"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {q.trim() && results.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Ничего не найдено"
          subtitle="Попробуйте изменить запрос или поищите по категории"
          buttonLabel="В каталог"
          to="/catalog"
        />
      )}

      {results.length > 0 && (
        <>
          <p className="px-4 pt-3 text-[12px] text-muted">
            Найдено: {results.length}
          </p>
          <section className="grid grid-cols-2 gap-3 px-4 pt-2 pb-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        </>
      )}
    </div>
  )
}
