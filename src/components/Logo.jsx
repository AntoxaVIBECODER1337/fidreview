import { useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Официальный логотип ОМА: положите файл в public/img/oma-logo.png
 * (или .svg — тогда поменяйте путь ниже).
 * Пока файла нет, показываем текстовую надпись «ОМА».
 */
const LOGO_SRC = '/img/oma-logo.png'

export default function Logo({ className = 'h-8 w-auto' }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <span className="text-[22px] leading-8 font-black tracking-wide text-brand-600">ОМА</span>
  }

  return (
    <img
      src={LOGO_SRC}
      alt="ОМА"
      className={cn('object-contain', className)}
      onError={() => setFailed(true)}
      draggable={false}
    />
  )
}
