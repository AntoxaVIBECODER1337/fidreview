import { DECOR_PACKS } from '../data/decorPacks'
import { getProduct } from './catalog'

export { DECOR_PACKS }

export const getPack = (id) => DECOR_PACKS.find((p) => p.id === id)

/** Минимум позиций в пакете — не меньше половины */
export const minSlots = (pack) => Math.ceil(pack.slots.length / 2)

/** Цена пакета по выбранным вариантам: choice = { [slotId]: variantIndex | null } (null — убрано) */
export function packPrice(pack, choice = {}) {
  return round2(
    pack.slots.reduce((s, slot) => {
      const v = choice[slot.id] === undefined ? 0 : choice[slot.id]
      if (v === null) return s
      return s + (getProduct(slot.variants[v])?.price ?? 0)
    }, 0),
  )
}

/** Базовая цена пакета (все позиции, первые варианты) */
export const packFromPrice = (pack) => packPrice(pack)

/** Товары оформленного пакета для корзины */
export function packItems(pack, choice) {
  return pack.slots.flatMap((slot) => {
    const v = choice[slot.id] === undefined ? 0 : choice[slot.id]
    return v === null ? [] : [{ id: slot.variants[v], qty: 1 }]
  })
}

/** Цена пакета из корзины */
export const bundlePrice = (bundle) =>
  round2(bundle.items.reduce((s, i) => s + (getProduct(i.id)?.price ?? 0) * i.qty, 0))

export const round2 = (n) => Math.round(n * 100) / 100
