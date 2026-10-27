import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import BottomNav from './components/BottomNav.jsx'
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
import SearchPage from './pages/SearchPage.jsx'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh justify-center">
      <div className="relative w-full max-w-[430px] bg-white shadow-xl">
        <main className="pb-28">
          <Routes>
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
        </main>
        <Toast />
        <BottomNav />
      </div>
    </div>
  )
}
