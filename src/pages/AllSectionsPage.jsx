import CategoryCard from '../components/CategoryCard.jsx'
import Header from '../components/Header.jsx'
import { categories } from '../lib/catalog'

const AKCII = { id: 'akcii', name: 'Акции' }

/** Все разделы каталога — карточки как на главной странице каталога */
export default function AllSectionsPage() {
  return (
    <div>
      <Header back title="Все разделы" />

      <section className="grid grid-cols-2 items-stretch gap-3 px-4 pt-4 pb-6">
        <CategoryCard section={AKCII} />
        {categories.map((c) => (
          <CategoryCard key={c.id} section={c} />
        ))}
      </section>
    </div>
  )
}
