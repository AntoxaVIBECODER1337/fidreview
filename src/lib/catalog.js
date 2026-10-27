import rawProducts from '../data/products.json'
import rawCategories from '../data/categories.json'

export const products = rawProducts
export const categories = rawCategories

export const getProduct = (id) => products.find((p) => p.id === id)

export const getCategory = (id) => categories.find((c) => c.id === id)

export const productsByCategory = (catId) => products.filter((p) => p.cat === catId)

export const popularProducts = () => products.filter((p) => p.popular)

export const saleProducts = () => products.filter((p) => p.oldPrice)

export const searchProducts = (query) => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (getCategory(p.cat)?.name ?? '').toLowerCase().includes(q),
  )
}

export const similarProducts = (product, limit = 4) =>
  products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, limit)
