import {
  Bell,
  BellPlus,
  ClipboardList,
  Eye,
  FileText,
  ListChecks,
  Package,
  PhoneCall,
  Store,
  Undo2,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BonusCard from '../components/BonusCard.jsx'
import Header from '../components/Header.jsx'
import { useStore } from '../store/StoreContext'

const ACCOUNT = [
  { icon: Bell, label: 'История уведомлений', action: 'toast' },
  { icon: BellPlus, label: 'Настройки уведомлений', action: 'toast' },
  { icon: Package, label: 'Купленные товары', action: 'toast' },
  { icon: ClipboardList, label: 'История заказов', to: '/orders' },
  { icon: Eye, label: 'История просмотров', action: 'toast' },
  { icon: UserRound, label: 'Моя информация', action: 'toast' },
]

const HELP = [
  { icon: PhoneCall, label: 'Позвонить нам', href: 'tel:+3751753364500' },
  { icon: Undo2, label: 'Возврат и гарантия', action: 'toast' },
  { icon: FileText, label: 'Договор публичной оферты', action: 'toast' },
  { icon: Store, label: 'Адреса магазинов', action: 'toast' },
  { icon: ListChecks, label: 'Список сравнения', to: '/compare' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, orders, logout, showToast, demoLogin } = useStore()

  const onRow = (row) => {
    if (row.to) navigate(row.to)
    else if (row.href) window.location.href = row.href
    else showToast('Демо-версия: раздел появится позже')
  }

  const Row = (row) => (
    <button
      key={row.label}
      onClick={() => onRow(row)}
      className="flex w-full items-center gap-3 border-b border-line py-4 text-left last:border-b-0 hide-tap"
    >
      <row.icon className="h-5 w-5 text-[#243044]" strokeWidth={1.7} />
      <span className="flex-1 text-[14px] font-medium text-[#22354d]">{row.label}</span>
    </button>
  )

  return (
    <div className="px-4">
      <Header title="Профиль" />

      {!user ? (
        <div className="pt-4">
          <button
            onClick={demoLogin}
            className="h-12 w-full rounded-lg bg-brand-600 text-[15px] font-semibold text-white shadow-[0_6px_20px_rgb(29_93_190/0.35)] hide-tap active:bg-brand-700"
          >
            ⚡ Быстрый вход для демо
          </button>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 h-11 w-full rounded-lg border border-brand-600/40 bg-white text-[14px] font-semibold text-brand-600 hide-tap active:bg-brand-50"
          >
            Войти по номеру телефона
          </button>
          <p className="mt-2.5 text-center text-[12px] text-muted">
            Войдите, чтобы подключить карту лояльности
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-[14px] font-bold text-white">
            {user.name
              ? user.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
              : user.phone.slice(-2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-navy">{user.name || user.phone}</p>
            <p className="truncate text-[11px] text-muted">
              {user.name ? `${user.phone} · ` : ''}Заказов: {orders.length}
              {user.demo ? ' · демо' : ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-semibold text-price"
          >
            Выйти
          </button>
        </div>
      )}

      <BonusCard />

      <h2 className="mt-7 text-[16px] font-bold text-navy">Личный кабинет</h2>
      <div className="mt-1">{ACCOUNT.map((r) => Row(r))}</div>

      <h2 className="mt-6 text-[16px] font-bold text-navy">Помощь</h2>
      <div className="mt-1">{HELP.map((r) => Row(r))}</div>

      <p className="mt-8 pb-2 text-center text-[11px] text-muted">ОМА · демо-версия для хакатона</p>
    </div>
  )
}
