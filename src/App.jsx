import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import BottomNav, { tabIndexFor } from './components/BottomNav.jsx'
import EmptyState from './components/EmptyState.jsx'
import Toast from './components/Toast.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import AllSectionsPage from './pages/AllSectionsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyHomePage from './pages/MyHomePage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

/* Направленные слайды между экранами (из oma-ozon) */
const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
}

/** Глубина пути: /product/1 глубже /catalog — значит «вперёд» */
const depth = (p) => p.split('/').filter(Boolean).length

export default function App() {
  const location = useLocation()
  const { pathname } = location
  const prev = useRef(pathname)
  const dir = useRef(1)

  if (prev.current !== pathname) {
    const a = tabIndexFor(prev.current)
    const b = tabIndexFor(pathname)
    dir.current =
      a !== b && a >= 0 && b >= 0 ? (b > a ? 1 : -1) : depth(pathname) >= depth(prev.current) ? 1 : -1
    prev.current = pathname
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh justify-center">
      <div className="relative w-full max-w-[430px] overflow-x-clip bg-white shadow-[0_0_80px_rgb(0_0_0/0.5)]">
        <main className="pb-28">
          <AnimatePresence mode="wait" custom={dir.current} initial={false}>
            <motion.div
              key={pathname}
              custom={dir.current}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/sections" element={<AllSectionsPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/my-home" element={<MyHomePage />} />
                <Route path="/my-home/project/:id" element={<ProjectPage />} />
                <Route
                  path="*"
                  element={
                    <EmptyState
                      icon={HelpCircle}
                      title="Страница не найдена"
                      buttonLabel="На главную"
                      to="/"
                    />
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Toast />
        <BottomNav />
      </div>
    </div>
  )
}
