import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

/**
 * Флаг Беларуси — SVG-плашка (эмодзи 🇧🇾 на Windows не рисуется,
 * браузер показывает просто буквы «BY»).
 */
function FlagBY() {
  return (
    <svg viewBox="0 0 20 12" className="h-3.5 w-[23px] rounded-[2px]" aria-label="Флаг Беларуси">
      <rect width="20" height="12" fill="#ffffff" />
      <rect y="0" width="20" height="8" fill="#d22730" />
      <rect y="8" width="20" height="4" fill="#4aa657" />
      {/* орнаментальная полоса у древка */}
      <rect width="3" height="12" fill="#ffffff" />
      <path d="M0.6 1.4 L2.4 1.4 L1.5 3 Z M0.6 4.6 L2.4 4.6 L1.5 6.2 Z M0.6 7.8 L2.4 7.8 L1.5 9.4 Z" fill="#d22730" />
      <rect x="0.6" y="10.4" width="1.8" height="1" fill="#d22730" />
    </svg>
  )
}

/**
 * Авторизация как в приложении ОМА (скриншот):
 * шапка с шевроном «назад» → по центру экрана заголовок,
 * поле с флагом Беларуси +375 → кнопка «Войти» (серая, пока номер не введён).
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, showToast } = useStore()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')

  const digits = phone.replace(/\D/g, '')

  const toCode = () => {
    if (digits.length < 9) return
    setStep('code')
  }

  const confirm = () => {
    if (code.length !== 4) return
    login(`+375 ${digits}`)
    showToast('Добро пожаловать в ОМА!')
    navigate('/profile')
  }

  return (
    <div className="flex min-h-[calc(100dvh-168px)] flex-col">
      {/* Шапка: шеврон «назад» + заголовок по центру */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="relative flex h-14 items-center px-1">
          <button
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="flex h-10 w-10 items-center justify-center text-navy hide-tap active:bg-bg"
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={2.4} />
          </button>
          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-navy">
            Авторизация
          </h1>
        </div>
      </header>

      {/* Контент по центру экрана */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <p className="text-center text-[17px] font-bold text-navy">
          {step === 'phone' ? 'Введите номер телефона' : 'Введите код из SMS'}
        </p>

        {step === 'phone' ? (
          <>
            <div className="mt-6 flex h-14 w-full items-center gap-2.5 rounded-[10px] border border-line bg-white px-2.5 focus-within:ring-2 focus-within:ring-brand-200">
              {/* Серый чип с флагом — перед номером */}
              <span className="flex h-8 shrink-0 items-center rounded-md bg-panel px-2">
                <FlagBY />
              </span>
              <span className="text-[17px] font-medium text-navy">+375</span>
              <input
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="min-w-0 flex-1 bg-transparent text-[17px] tracking-wide text-navy outline-none"
              />
            </div>
            <button
              onClick={toCode}
              disabled={digits.length < 9}
              className="mt-4 h-12 w-full rounded-[10px] bg-brand-600 text-[16px] font-semibold text-white disabled:bg-[#c9cbd0] hide-tap active:bg-brand-700"
            >
              Войти
            </button>
          </>
        ) : (
          <>
            <div className="mt-6 flex h-14 w-full items-center rounded-[10px] bg-panel px-3.5 focus-within:ring-2 focus-within:ring-brand-200">
              <input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="0000"
                className="w-full bg-transparent text-center text-[24px] font-bold tracking-[0.45em] text-navy outline-none placeholder:text-[#c1c4ca]"
              />
            </div>
            <p className="mt-3 text-center text-[12px] text-muted">
              Код отправлен на +375 {digits} · демо: любые 4 цифры
            </p>
            <button
              onClick={confirm}
              disabled={code.length !== 4}
              className="mt-4 h-12 w-full rounded-[10px] bg-brand-600 text-[16px] font-semibold text-white disabled:bg-[#c9cbd0] hide-tap active:bg-brand-700"
            >
              Подтвердить
            </button>
            <button
              onClick={() => setStep('phone')}
              className="mt-4 text-center text-[13px] font-semibold text-brand-600 hide-tap"
            >
              Изменить номер
            </button>
          </>
        )}
      </div>
    </div>
  )
}
