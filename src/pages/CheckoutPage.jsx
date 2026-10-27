import { useState } from 'react'
import { Banknote, CheckCircle2, CreditCard, MapPin, ShoppingBag, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import { getProduct } from '../lib/catalog'
import { rub } from '../lib/format'
import { useStore } from '../store/StoreContext'

const STORE_ADDRESS = 'Самовывоз: г. Минск, ул. Притыцкого, 62 — сегодня, бесплатно'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, placeOrder, showToast } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [delivery, setDelivery] = useState('Самовывоз')
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState('При получении')

  const items = Object.entries(cart).flatMap(([id, qty]) => {
    const p = getProduct(id)
    return p ? [{ product: p, qty }] : []
  })
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)

  if (items.length === 0) {
    return (
      <div>
        <Header back title="Оформление" />
        <EmptyState
          icon={ShoppingBag}
          title="Корзина пуста"
          subtitle="Нечего оформлять — добавьте товары из каталога"
          buttonLabel="В каталог"
          to="/catalog"
        />
      </div>
    )
  }

  const submit = () => {
    if (!name.trim() || !phone.trim() || (delivery === 'Доставка' && !address.trim())) {
      showToast('Заполните имя, телефон и адрес')
      return
    }
    placeOrder({ name, phone, delivery, address, payment })
    navigate('/order-success')
  }

  const inputCls =
    'h-11 w-full rounded-lg border border-line bg-white px-3 text-[14px] text-navy placeholder:text-muted focus:border-brand-500'
  const labelCls = 'mb-1 block text-[12px] text-muted'

  return (
    <div>
      <Header back title="Оформление" />

      <section className="px-4 pt-4">
        <h3 className="text-[14px] font-bold text-navy">Способ получения</h3>
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={() => setDelivery('Самовывоз')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left hide-tap ${
              delivery === 'Самовывоз' ? 'border-accent bg-accent-soft' : 'border-line bg-white'
            }`}
          >
            <MapPin className="h-5 w-5 text-accent" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-navy">Самовывоз из магазина</span>
              <span className="block text-[11px] text-muted">{STORE_ADDRESS}</span>
            </span>
            <span
              className={`h-5 w-5 rounded-full border-2 ${
                delivery === 'Самовывоз' ? 'border-accent bg-accent' : 'border-[#c9d2dd]'
              }`}
            />
          </button>
          <button
            onClick={() => setDelivery('Доставка')}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left hide-tap ${
              delivery === 'Доставка' ? 'border-accent bg-accent-soft' : 'border-line bg-white'
            }`}
          >
            <Truck className="h-5 w-5 text-accent" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-navy">Доставка по Минску</span>
              <span className="block text-[11px] text-muted">Завтра, 5.90 р. · бесплатно от 500 р.</span>
            </span>
            <span
              className={`h-5 w-5 rounded-full border-2 ${
                delivery === 'Доставка' ? 'border-accent bg-accent' : 'border-[#c9d2dd]'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="mt-5 px-4">
        <h3 className="text-[14px] font-bold text-navy">Данные получателя</h3>
        <div className="mt-2 flex flex-col gap-3">
          <div>
            <label className={labelCls}>Имя и фамилия*</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Телефон*</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="+375 (29) 123-45-67"
              className={inputCls}
            />
          </div>
          {delivery === 'Доставка' && (
            <div>
              <label className={labelCls}>Адрес доставки*</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ул. Кальварийская, 1, кв. 12"
                className={inputCls}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 px-4">
        <h3 className="text-[14px] font-bold text-navy">Оплата</h3>
        <div className="mt-2 flex gap-2">
          {[
            { id: 'При получении', icon: Banknote },
            { id: 'Картой онлайн', icon: CreditCard },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPayment(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-[13px] font-semibold hide-tap ${
                payment === id ? 'border-brand-600 text-brand-700' : 'border-line text-[#3f4756]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {id}
            </button>
          ))}
        </div>
      </section>

      {/* Итог */}
      <section className="mx-4 mt-6 rounded-xl bg-navy p-4 text-white">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-bold">Итого:</span>
          <span className="text-[20px] font-black">{rub(total)}</span>
        </div>
        <button
          onClick={submit}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[15px] font-bold text-white hide-tap active:bg-accent-dark"
        >
          <CheckCircle2 className="h-5 w-5" />
          Подтвердить заказ
        </button>
      </section>
    </div>
  )
}
