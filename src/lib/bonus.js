/**
 * Бонусная программа ОМА (демо): кэшбэк баллами, 1 балл = 1 рубль.
 * Уровень растёт от суммы покупок.
 */
export const LEVELS = [
  { id: 'base', name: 'Базовый', from: 0, rate: 3 },
  { id: 'silver', name: 'Серебро', from: 500, rate: 5 },
  { id: 'gold', name: 'Золото', from: 1500, rate: 7 },
]

export const WELCOME_BONUS = 20

export function levelFor(spent) {
  return [...LEVELS].reverse().find((l) => spent >= l.from) ?? LEVELS[0]
}

export function nextLevel(spent) {
  return LEVELS.find((l) => l.from > spent) ?? null
}

/** Номер виртуальной карты из телефона пользователя — стабильный между входами */
export function cardNumber(phone = '') {
  const d = (phone.replace(/\D/g, '') + '7319046285').slice(-10)
  return `2981 ${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 10)}`
}

export const cashbackFor = (total, spent) => Math.round((total * levelFor(spent).rate) / 100)
