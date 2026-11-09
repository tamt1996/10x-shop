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

// დაცული მარშრუტი - უშვებს მხოლოდ ავტორიზებულ მომხმარებელს
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

// საპირისპირო მარშრუტი - თუ უკვე შესულია, /login-ზე აღარ შეუშვას და გადაიყვანოს მთავარზე
function PublicOnlyRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn } = useAuth()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function MainLayout() {
  const { cartCount } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} />

      <Routes>
        {/* საჯარო გვერდები */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* დაცული გვერდები (მხოლოდ ავტორიზებულებისთვის) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

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

        {/* 404 გვერდი */}
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
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <MainLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}