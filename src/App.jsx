import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import BottomNav, { screenKey, tabIndexFor } from './components/BottomNav.jsx'
import CompareBar from './components/CompareBar.jsx'
import EmptyState from './components/EmptyState.jsx'
import Onboarding from './components/Onboarding.jsx'
import { PhoneFrame, usePhoneFrame } from './components/PhoneFrame.jsx'
import Toast from './components/Toast.jsx'
import AllSectionsPage from './pages/AllSectionsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyHomePage from './pages/MyHomePage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import CrewsPage from './pages/CrewsPage.jsx'
import DecorPackPage from './pages/DecorPackPage.jsx'
import DecorPacksPage from './pages/DecorPacksPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import { useStore } from './store/StoreContext'

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
  const framed = usePhoneFrame()
  const { onboarded } = useStore()
  const scroller = useRef(null)

  if (prev.current !== pathname && screenKey(prev.current) !== screenKey(pathname)) {
    const a = tabIndexFor(prev.current)
    const b = tabIndexFor(pathname)
    dir.current =
      a !== b && a >= 0 && b >= 0 ? (b > a ? 1 : -1) : depth(pathname) >= depth(prev.current) ? 1 : -1
  }
  prev.current = pathname

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
    else window.scrollTo(0, 0)
  }, [pathname])

  const screen = (
        <main className="pb-28">
          <AnimatePresence mode="wait" custom={dir.current} initial={false}>
            <motion.div
              key={screenKey(pathname)}
              custom={dir.current}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Home />} />
                <Route path="/sections" element={<AllSectionsPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/favorites" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/my-home" element={<MyHomePage />} />
                <Route path="/my-home/project/:id" element={<ProjectPage />} />
                <Route path="/crews" element={<CrewsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/decor" element={<DecorPacksPage />} />
                <Route path="/decor/:id" element={<DecorPackPage />} />
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
  )

  /* Меню, тосты, сравнение, онбординг и шторки (#overlay-root) — поверх экрана */
  const overlay = (
    <>
      <CompareBar />
      <Toast />
      <BottomNav />
      <AnimatePresence>{!onboarded && <Onboarding key="onboarding" />}</AnimatePresence>
      <div id="overlay-root" />
    </>
  )

  if (framed) {
    return (
      <PhoneFrame ref={scroller} overlay={overlay}>
        {screen}
      </PhoneFrame>
    )
  }

  return (
    <div className="flex min-h-dvh justify-center">
      <div className="relative w-full max-w-[430px] overflow-x-clip bg-white shadow-[0_0_80px_rgb(0_0_0/0.5)]">
        {screen}
        {overlay}
      </div>
    </div>
  )
}
