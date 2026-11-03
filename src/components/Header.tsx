import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface HeaderProps {
  cartCount: number
}

function Header({ cartCount }: HeaderProps) {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <span className="text-3xl text-[#C9A04B]">✦</span>
          <span>
            <span className="text-[#C9A04B]">10X</span>{' '}
            <span className="text-white">Shop</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium sm:gap-x-7">
          <Link to="/" className="text-white transition hover:text-[#E4C47A]">
            Home
          </Link>

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="text-white transition hover:text-[#E4C47A]"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                to="/profile"
                className="text-white transition hover:text-[#E4C47A]"
              >
                My Profile
              </Link>

              <Link
                to="/orders"
                className="text-white transition hover:text-[#E4C47A]"
              >
                My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-white transition hover:text-red-400"
              >
                Logout
              </button>
            </>
          )}

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-[#C9A04B]/50 px-4 py-2 text-white transition hover:bg-[#C9A04B] hover:text-black"
          >
            <span>Cart</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C9A04B] px-1.5 text-xs font-bold text-black">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header