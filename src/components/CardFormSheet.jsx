import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Sheet from './Sheet.jsx'
import { Tap } from './ui.jsx'
import { useStore } from '../store/StoreContext'
import { cn } from '../lib/cn'

/** Маска номера: 0000 0000 0000 0000 */
const fmtNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

/** Маска срока: ММ/ГГ */
const fmtExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const brandOf = (digits) =>
  digits.startsWith('4') ? 'VISA' : /^[52]/.test(digits) ? 'MASTERCARD' : digits ? 'КАРТА' : ''

/** Срок действия: месяц 01–12 и не раньше текущего */
function expError(exp) {
  const m = exp.match(/^(\d{2})\/(\d{2})$/)
  if (!m) return 'Укажите срок как ММ/ГГ'
  const month = +m[1]
  if (month < 1 || month > 12) return 'Месяц с 01 по 12'
  const now = new Date()
  const year = 2000 + +m[2]
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'Срок действия истёк'
  }
  return ''
}

/**
 * Шторка привязки карты: живое превью, маски полей и проверка.
 * В стор уходят только последние 4 цифры, срок и имя.
 */
export default function CardFormSheet({ onClose, onAdded }) {
  const { addCard, showToast } = useStore()
  const [number, setNumber] = useState('')
  const [exp, setExp] = useState('')
  const [cvc, setCvc] = useState('')
  const [holder, setHolder] = useState('')
  const [sent, setSent] = useState(false)

  const digits = number.replace(/\D/g, '')
  const errors = {
    number: digits.length === 16 ? '' : 'Введите 16 цифр номера',
    exp: expError(exp),
    cvc: cvc.length === 3 ? '' : '3 цифры с обратной стороны',
    holder: holder.trim().length >= 3 ? '' : 'Имя и фамилия, как на карте',
  }
  const valid = Object.values(errors).every((e) => !e)
  const show = (f) => sent && errors[f]

  const submit = () => {
    setSent(true)
    if (!valid) return
    const id = addCard({ number: digits, name: holder, exp })
    showToast('Карта привязана')
    onAdded?.(id)
    onClose?.()
  }

  const inputCls = (field) =>
    cn(
      'h-11 w-full rounded-lg border bg-white px-3 text-[14px] text-navy placeholder:text-muted focus:border-brand-500',
      show(field) ? 'border-price' : 'border-line',
    )
  const errCls = 'mt-1 block text-[11px] text-price'
  const labelCls = 'mb-1 block text-[12px] text-muted'

  return (
    <Sheet title="Привязка карты" subtitle="Оплата картой онлайн в ОМА" onClose={onClose} maxH="92dvh">
      {/* Живое превью карты */}
      <div className="relative mx-auto aspect-[1.586/1] w-full max-w-[300px] overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1e3a5c_0%,#1d5dbe_100%)] p-4 text-white shadow-lift">
        <span className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/10" />
        <div className="flex items-start justify-between">
          <span className="h-7 w-9 rounded-md bg-[linear-gradient(135deg,#f0d9a0,#c9a24b)]" />
          <span className="text-[13px] font-black tracking-wider">{brandOf(digits) || 'КАРТА'}</span>
        </div>
        <div className="mt-5 font-mono text-[17px] tracking-[0.14em]">
          {number || '•••• •••• •••• ••••'}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="min-w-0 truncate text-[11.5px] tracking-wider uppercase text-white/85">
            {holder || 'Имя держателя'}
          </span>
          <span className="shrink-0 font-mono text-[12px] text-white/85">{exp || 'ММ/ГГ'}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="block">
          <span className={labelCls}>Номер карты</span>
          <input
            value={number}
            onChange={(e) => setNumber(fmtNumber(e.target.value))}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            className={inputCls('number')}
          />
          {show('number') && <span className={errCls}>{errors.number}</span>}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Срок действия</span>
            <input
              value={exp}
              onChange={(e) => setExp(fmtExp(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="ММ/ГГ"
              maxLength={5}
              className={inputCls('exp')}
            />
            {show('exp') && <span className={errCls}>{errors.exp}</span>}
          </label>
          <label className="block">
            <span className={labelCls}>CVC/CVV</span>
            <input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              inputMode="numeric"
              autoComplete="cc-csc"
              type="password"
              placeholder="•••"
              className={inputCls('cvc')}
            />
            {show('cvc') && <span className={errCls}>{errors.cvc}</span>}
          </label>
        </div>

        <label className="block">
          <span className={labelCls}>Имя на карте</span>
          <input
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            autoComplete="cc-name"
            placeholder="IVAN IVANOV"
            className={inputCls('holder')}
          />
          {show('holder') && <span className={errCls}>{errors.holder}</span>}
        </label>
      </div>

      <Tap
        onClick={submit}
        className="mt-4 h-12 w-full rounded-lg bg-brand-600 text-[15px] font-semibold text-white active:bg-brand-700"
      >
        Привязать карту
      </Tap>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
        <ShieldCheck size={13} className="shrink-0" /> Номер не сохраняется — только последние 4 цифры
      </p>
    </Sheet>
  )
}
