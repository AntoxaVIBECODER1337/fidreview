import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getProduct } from '../lib/catalog'
import { PROMOS } from '../lib/promo'

const CART_KEY = 'oma.cart'
const FAV_KEY = 'oma.favorites'
const ORDERS_KEY = 'oma.orders'
const USER_KEY = 'oma.user'
const PROMO_KEY = 'oma.promo'
const PROJECTS_KEY = 'oma.projects'
const CITY_KEY = 'oma.city'

/** Демо-пользователь для быстрого входа на защите */
export const DEMO_USER = {
  name: 'Дмитрий Ковалёв',
  phone: '+375 29 123-45-67',
  address: 'г. Минск, пр. Независимости, 58, кв. 12',
  demo: true,
}

/** Этапы проекта — 4 шага как в репозитории oma-ozon */
export const PROJECT_STAGES = [
  { name: 'Замер и подтверждение сметы' },
  { name: 'Доставка материалов с подъёмом' },
  { name: 'Черновые работы' },
  { name: 'Чистовые работы и приёмка' },
]

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* приватный режим — игнорируем */
  }
}

const StoreCtx = createContext(null)

/** Тосты-уведомления доступны компонентам ниже по дереву */
let toastSeq = 0

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load(CART_KEY, {}))
  const [favorites, setFavorites] = useState(() => load(FAV_KEY, []))
  const [orders, setOrders] = useState(() => load(ORDERS_KEY, []))
  const [user, setUser] = useState(() => load(USER_KEY, null))
  const [promo, setPromo] = useState(() => load(PROMO_KEY, null))
  const [projects, setProjects] = useState(() => load(PROJECTS_KEY, []))
  const [city, setCity] = useState(() => load(CITY_KEY, 'Минск'))
  const [toast, setToast] = useState(null)

  useEffect(() => persist(CART_KEY, cart), [cart])
  useEffect(() => persist(FAV_KEY, favorites), [favorites])
  useEffect(() => persist(ORDERS_KEY, orders), [orders])
  useEffect(() => persist(USER_KEY, user), [user])
  useEffect(() => persist(PROMO_KEY, promo), [promo])
  useEffect(() => persist(PROJECTS_KEY, projects), [projects])
  useEffect(() => persist(CITY_KEY, city), [city])

  const showToast = useCallback((text) => {
    setToast({ id: ++toastSeq, text })
  }, [])

  const setQty = useCallback((id, qty) => {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }, [])

  const addToCart = useCallback((id, qty = 1) => {
    setCart((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + qty }
      if (next[id] <= 0) delete next[id]
      return next
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const clearCart = useCallback(() => setCart({}), [])

  const toggleFav = useCallback(
    (id) => {
      setFavorites((prev) => {
        const has = prev.includes(id)
        showToast(has ? 'Удалено из избранного' : 'Добавлено в избранное ♥')
        return has ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [showToast],
  )

  const login = useCallback(
    (phone, profile = {}) => {
      setUser({ phone, ...profile })
      showToast(profile.name ? `Добро пожаловать, ${profile.name}!` : 'Вы вошли в аккаунт')
    },
    [showToast],
  )

  /** Быстрый вход для демо: готовый профиль без заполнения полей */
  const demoLogin = useCallback(() => {
    setUser({ ...DEMO_USER })
    showToast(`Добро пожаловать, ${DEMO_USER.name.split(' ')[0]}!`)
  }, [showToast])

  const logout = useCallback(() => {
    setUser(null)
    showToast('Вы вышли из аккаунта')
  }, [showToast])

  const applyPromo = useCallback(
    (code) => {
      const clean = code.trim().toUpperCase()
      if (PROMOS[clean]) {
        setPromo(clean)
        showToast(`Промокод ${clean} применён`)
        return true
      }
      showToast('Такого промокода нет')
      return false
    },
    [showToast],
  )

  const clearPromo = useCallback(() => setPromo(null), [])

  const placeOrder = useCallback(
    (info) => {
      const items = Object.entries(cart).flatMap(([id, qty]) => {
        const p = getProduct(id)
        return p ? [{ id, name: p.name, qty, price: p.price }] : []
      })
      const total = items.reduce((s, i) => s + i.price * i.qty, 0)
      const order = {
        number: String(Math.floor(Math.random() * 900000) + 100000),
        date: new Date().toISOString(),
        items,
        total,
        status: 'В обработке',
        delivery: info.delivery,
        address: info.address || 'Самовывоз, г. Минск, ул. Притыцкого, 62',
        payment: info.payment,
      }
      setOrders((prev) => [order, ...prev])
      setCart({})
      return order
    },
    [cart],
  )

  /** Создать проект из текущей корзины (данные — только свои, из products.json) */
  const createProjectFromCart = useCallback(() => {
    const items = Object.entries(cart).flatMap(([id, qty]) => {
      const p = getProduct(id)
      return p ? [{ id, qty }] : []
    })
    if (!items.length) return null
    const itemsTotal = items.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0)
    const project = {
      id: 'p' + Date.now(),
      title: `Проект от ${new Date().toLocaleDateString('ru-RU')}`,
      items,
      itemsTotal,
      crewTotal: 0,
      status: 'pending',
      currentStage: 0,
    }
    setProjects((prev) => [project, ...prev])
    setCart({})
    showToast('Проект создан — товары перенесены из корзины')
    return project
  }, [cart, showToast])

  /** Проект из ИИ-подборки: материалы + (опционально) бригада ОМА */
  const createProject = useCallback(
    ({ title, items, crew = null, area = null, scenario = null }) => {
      const clean = items.filter((i) => getProduct(i.id))
      const itemsTotal = clean.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0)
      const crewTotal = crew && area ? crew.rate * area : 0
      const project = {
        id: 'p' + Date.now(),
        title,
        items: clean.map(({ id, qty }) => ({ id, qty })),
        itemsTotal,
        crewTotal,
        crew,
        area,
        scenario,
        status: 'pending',
        currentStage: 0,
      }
      setProjects((prev) => [project, ...prev])
      showToast(crew ? `Проект с бригадой ${crew.name} создан` : 'Проект создан')
      return project
    },
    [showToast],
  )

  /** Выбор бригады для проекта: цена работ = ставка × площадь */
  const assignCrew = useCallback(
    (projectId, crew, area) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, crew, area, crewTotal: crew.rate * area } : p)),
      )
      showToast(`Бригада ${crew.name} выбрана для проекта`)
    },
    [showToast],
  )

  /** «Оформить и начать работу»: pending → active */
  const approveProject = useCallback(
    (id) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'active', currentStage: 0 } : p)),
      )
      showToast('Проект запущен!')
    },
    [showToast],
  )

  /** «Подтвердить этап»: следующий этап, максимум — последний */
  const advanceStage = useCallback((id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id && p.status === 'active'
          ? { ...p, currentStage: Math.min(p.currentStage + 1, PROJECT_STAGES.length - 1) }
          : p,
      ),
    )
  }, [])

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)

  return (
    <StoreCtx.Provider
      value={{
        cart,
        cartCount,
        favorites,
        orders,
        user,
        promo,
        projects,
        toast,
        createProjectFromCart,
        createProject,
        assignCrew,
        city,
        setCity,
        approveProject,
        advanceStage,
        addToCart,
        setQty,
        removeFromCart,
        clearCart,
        toggleFav,
        login,
        demoLogin,
        logout,
        applyPromo,
        clearPromo,
        placeOrder,
        showToast,
      }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore должен вызываться внутри <StoreProvider>')
  return ctx
}
