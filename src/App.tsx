import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from 'react-router-dom'
import type { ReactNode } from 'react'

import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ProductDetails from './pages/ProductDetails'
import Orders from './pages/Orders'
import Profile from './pages/Profile'

import { CartProvider } from './context/CartContext'
import { useCart } from './context/useCart'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <>{children}</>
}

function AppContent() {
  const { cartCount } = useCart()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={cartCount} />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <main className="px-6 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  Page not found
                </h1>

                <p className="mt-3 text-gray-600">
                  The page you are looking for does not exist.
                </p>

                <Link
                  to="/"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  Go to catalog
                </Link>
              </main>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App