import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'

export default function OrderSuccessPage() {
  const { orders } = useStore()
  const last = orders[0]

  if (!last) {
    return (
      <div className="flex flex-col items-center px-8 py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-brand-600" />
        <h2 className="mt-5 text-[18px] font-bold text-navy">Заказ оформлен!</h2>
        <Link
          to="/"
          className="mt-6 flex h-11 items-center rounded-lg bg-brand-600 px-8 text-[14px] font-semibold text-white"
        >
          На главную
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center px-8 pt-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
        <CheckCircle2 className="h-12 w-12 text-brand-600" />
      </div>
      <h2 className="mt-5 text-[20px] font-black text-navy">Заказ оформлен!</h2>
      <p className="mt-3 text-[13px] leading-5 text-[#3f4756]">
        Номер заказа <b>№{last.number}</b>.{last.delivery === 'Доставка' ? ' Доставим по адресу:' : ' Заберите в магазине:'}{' '}
        {last.address}
      </p>
      <p className="mt-2 text-[13px] text-muted">
        Мы пришлём SMS, когда заказ будет собран
      </p>
      <div className="mt-4 rounded-xl border border-line bg-panel px-5 py-3 text-[15px] font-extrabold text-navy">
        {rub(last.total)}
      </div>
      <div className="mt-6 flex w-full flex-col gap-2">
        <Link
          to="/orders"
          className="flex h-11 items-center justify-center rounded-lg bg-brand-600 text-[14px] font-semibold text-white active:bg-brand-700"
        >
          Мои заказы
        </Link>
        <Link
          to="/"
          className="flex h-11 items-center justify-center rounded-lg border border-line text-[14px] font-semibold text-navy"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
