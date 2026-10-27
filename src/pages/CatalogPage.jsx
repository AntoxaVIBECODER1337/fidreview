import SearchBar from '../components/SearchBar.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import { categories } from '../lib/catalog'

/** Порядок первых плиток как в приложении, остальные — по порядку из данных */
const GRID = [
  'interier',
  'blagoustroystvo',
  'stroymaterialy',
  'instrument',
  'mebel',
  'bytovaya-tehnika',
  'tovary-dlya-doma',
]

const AKCII = { id: 'akcii', name: 'Акции' }

export default function CatalogPage() {
  // Сначала разделы из GRID (как на скрине), затем все остальные — весь каталог сразу
  const ordered = [
    ...GRID.map((id) => categories.find((c) => c.id === id)).filter(Boolean),
    ...categories.filter((c) => !GRID.includes(c.id)),
  ]

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <h1 className="py-3.5 text-center text-[17px] font-bold text-navy">Каталог</h1>
        <div className="px-4 pb-3">
          <SearchBar />
        </div>
      </header>

      <section className="grid grid-cols-2 items-stretch gap-3 px-4 pt-4 pb-6">
        <CategoryCard section={AKCII} />
        {ordered.map((c) => (
          <CategoryCard key={c.id} section={c} />
        ))}
      </section>
    </div>
  )
}
