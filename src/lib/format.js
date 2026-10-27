/** 18540 → «18 540», 8.4 → «8.40» */
export function price(n) {
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2)
  const [int, dec] = fixed.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return dec ? `${grouped}.${dec}` : grouped
}

export const rub = (n) => `${price(n)} р.`

/** Русская плюрализация: plural(5, ['товар', 'товара', 'товаров']) → «товаров» */
export function plural(n, forms) {
  const abs = Math.abs(n) % 100
  const n1 = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

export const countProducts = (n) => `${n} ${plural(n, ['товар', 'товара', 'товаров'])}`

export const countReviews = (n) => `${n} ${plural(n, ['отзыв', 'отзыва', 'отзывов'])}`

export const discountPercent = (price, oldPrice) => Math.round((1 - price / oldPrice) * 100)
