import { Heart } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import { getProduct } from '../lib/catalog'
import { useStore } from '../store/StoreContext'

export default function FavoritesPage() {
  const { favorites } = useStore()
  const items = favorites.map(getProduct).filter(Boolean)

  return (
    <div>
      <Header title="Избранное" />
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="У вас нет избранных товаров"
          subtitle="Нажмите на ♡ напротив любого товара, чтобы вернуться к нему позже"
          buttonLabel="Вернуться к покупкам"
          to="/catalog"
        />
      ) : (
        <section className="grid grid-cols-2 gap-3 px-4 pt-4 pb-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </div>
  )
}
