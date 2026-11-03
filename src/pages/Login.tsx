import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Login() {
  const navigate = useNavigate()
  const { login, isLoggedIn } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const success = login(username, password)

    if (success) {
      navigate('/profile', { replace: true })
    } else {
      setError('Please enter your username and password.')
    }
  }

  if (isLoggedIn) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#E4D8C5] bg-white p-8 shadow-sm"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to continue shopping.
        </p>

        <label
          htmlFor="username"
          className="mt-6 block text-sm font-medium text-gray-700"
        >
          Username
        </label>

        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
          placeholder="Enter your username"
        />

        <label
          htmlFor="password"
          className="mt-5 block text-sm font-medium text-gray-700"
        >
          Password
        </label>

        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-14 outline-none focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center justify-center rounded-r-lg px-4 text-xl text-gray-500 transition hover:text-[#C9A04B] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#C9A04B]"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-[#C9A04B] px-4 py-3 font-semibold text-black transition hover:bg-[#B78A32]"
        >
          Login
        </button>
      </form>
    </main>
  )
}

export default Login