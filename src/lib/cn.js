/** Склейка классов: cn('a', cond && 'b') → «a b» */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
