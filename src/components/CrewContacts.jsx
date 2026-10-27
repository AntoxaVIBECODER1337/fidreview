import { motion } from 'framer-motion'
import { AtSign, MessageCircle, Phone, Send } from 'lucide-react'
import { igHref, telHref, tgHref } from '../data/crews'
import { cn } from '../lib/cn'

/**
 * Быстрая связь с бригадой: «Позвонить» (tel:) и «Написать» (чат в приложении).
 * variant: 'light' — на белой карточке, 'dark' — на бренд-градиенте.
 */
export function QuickContact({ crew, onChat, variant = 'light', className }) {
  const dark = variant === 'dark'
  const base =
    'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors'
  return (
    <div className={cn('flex gap-2', className)}>
      <motion.a
        whileTap={{ scale: 0.96 }}
        href={telHref(crew)}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          base,
          dark ? 'bg-white/15 text-white active:bg-white/25' : 'border border-line bg-white text-navy active:bg-panel',
        )}
      >
        <Phone size={15} /> Позвонить
      </motion.a>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={(e) => {
          e.stopPropagation()
          onChat()
        }}
        className={cn(
          base,
          dark ? 'bg-white text-brand-700 active:bg-white/90' : 'bg-brand-600 text-white active:bg-brand-700',
        )}
      >
        <MessageCircle size={15} /> Написать
      </motion.button>
    </div>
  )
}

/** Список контактов: телефон, Telegram, Instagram */
export function ContactList({ crew }) {
  const rows = [
    { href: telHref(crew), Icon: Phone, label: crew.phone, hint: 'Позвонить' },
    crew.telegram && { href: tgHref(crew), Icon: Send, label: `@${crew.telegram}`, hint: 'Telegram' },
    crew.instagram && { href: igHref(crew), Icon: AtSign, label: `@${crew.instagram}`, hint: 'Instagram' },
  ].filter(Boolean)

  return (
    <div className="flex flex-col divide-y divide-line rounded-xl border border-line">
      {rows.map(({ href, Icon, label, hint }) => (
        <a
          key={hint}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="flex items-center gap-3 px-3.5 py-3 active:bg-panel"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <Icon size={15} className="text-brand-600" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-navy">{label}</span>
          <span className="shrink-0 text-[11.5px] text-muted">{hint}</span>
        </a>
      ))}
    </div>
  )
}
