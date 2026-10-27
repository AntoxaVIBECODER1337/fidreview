import { Package } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'

export default function OrdersPage() {
  const { orders } = useStore()

  return (
    <div className="px-4">
      <Header back title="История заказов" />

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="У вас пока нет заказов"
          subtitle="Оформите первый заказ — он появится здесь"
          buttonLabel="В каталог"
          to="/catalog"
        />
      ) : (
        <section className="flex flex-col gap-3 pt-4 pb-6">
          {orders.map((o) => (
            <div key={o.number} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-navy">Заказ №{o.number}</span>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold text-accent-dark">
                  {o.status}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {new Date(o.date).toLocaleString('ru', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                · {o.delivery}
              </p>
              <ul className="mt-2.5 text-[12px] leading-5 text-[#3f4756]">
                {o.items.slice(0, 2).map((i) => (
                  <li key={i.id} className="truncate">
                    {i.name} ×{i.qty}
                  </li>
                ))}
                {o.items.length > 2 && (
                  <li className="text-muted">и ещё {o.items.length - 2}…</li>
                )}
              </ul>
              <p className="mt-2 text-[14px] font-extrabold text-navy">{rub(o.total)}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
