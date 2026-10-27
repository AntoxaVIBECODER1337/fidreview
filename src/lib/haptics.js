/**
 * Тактильный отклик (navigator.vibrate). Работает на Android в Chrome;
 * на iOS и десктопе вызов просто ничего не делает.
 */
export function vibrate(pattern = 12) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    /* браузер запретил — игнорируем */
  }
}

export const HAPTIC = {
  add: 12,
  success: [18, 60, 28],
}
