
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

  const linkStyle =
    'flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 hover:text-[#E4C47A] sm:text-sm'

  return (
    <header className="border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-3 py-4 sm:px-6 md:flex-row md:justify-between md:gap-6 md:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <span className="text-3xl text-[#C9A04B]">✦</span>
          <span>
            <span className="text-[#C9A04B]">10X</span>{' '}
            <span className="text-white">Shop</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:justify-end">

          <Link to="/" className={linkStyle}>
            Home
          </Link>

          {!isLoggedIn ? (
            <Link to="/login" className={linkStyle}>
              Login
            </Link>
          ) : (
            <>
              <Link to="/profile" className={linkStyle}>
                My Profile
              </Link>

              <Link to="/orders" className={linkStyle}>
                My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 hover:text-red-400 sm:text-sm"
              >
                Logout
              </button>
            </>
          )}

          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#C9A04B]/50 px-3 py-2 text-xs text-white transition hover:bg-[#C9A04B] hover:text-black sm:text-sm"
          >
            Cart
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A04B] px-1.5 text-xs font-bold text-black">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
