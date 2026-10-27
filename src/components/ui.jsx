import { motion } from 'framer-motion'
import { cn } from '../lib/cn'

/**
 * UI-примитивы, перенесённые из репозитория oma-ozon (src/components/ui.tsx),
 * переведённые с TypeScript на чистый JSX.
 */

/* Tap: кнопка с press-анимацией */
export function Tap({ className, children, ...rest }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 550, damping: 28 }}
      className={cn('cursor-pointer outline-none', className)}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/* PrimaryButton: синяя CTA с тенью */
export function PrimaryButton({ className, children, ...rest }) {
  return (
    <Tap
      className={cn(
        'h-12 rounded-lg bg-brand-600 text-[15px] font-semibold text-white',
        'shadow-[0_6px_20px_rgb(29_93_190/0.35)]',
        'transition-colors duration-150 active:bg-brand-700',
        'disabled:opacity-60 disabled:shadow-none',
        className,
      )}
      {...rest}
    >
      {children}
    </Tap>
  )
}

/* Card: белая карточка */
export function Card({ className, children }) {
  return (
    <div className={cn('rounded-xl border border-line/70 bg-white shadow-soft', className)}>
      {children}
    </div>
  )
}

/* SectionTitle */
export function SectionTitle({ children }) {
  return <h2 className="text-[18px] font-bold text-navy">{children}</h2>
}

/* ProgressBar: анимированная полоса заполнения */
export function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <motion.div
        className="h-full rounded-full bg-brand-600"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/* Stagger-контейнер и элемент */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
}

export const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}
