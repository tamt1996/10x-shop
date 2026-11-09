
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const MIN_PASSWORD_LENGTH = 8

interface LocationState {
  from?: {
    pathname: string
  }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // თუ მომხმარებელი დაცულ გვერდზე გადადიოდა, შესვლის შემდეგ იმავე გვერდზე დავაბრუნოთ
  const state = location.state as LocationState
  const from = state?.from?.pathname || '/'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter your username.')
      return
    }

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return
    }

    const success = login(username, password)

    if (success) {
      navigate(from, { replace: true })
    } else {
      setError('Login failed. Please check your details.')
    }
  }

  // პაროლის ვალიდაციის სტატუსი (ვიზუალისთვის)
  const isPasswordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md rounded-2xl border border-[#E4D8C5] bg-white p-8 shadow-sm"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to continue shopping.
        </p>

        {/* Username input */}
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
          onChange={(event) => {
            setUsername(event.target.value)
            if (error) setError('')
          }}
          required
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
          placeholder="Enter your username"
        />

        {/* Password input */}
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
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError('')
            }}
            minLength={MIN_PASSWORD_LENGTH}
            required
            className={`w-full rounded-lg border px-4 py-3 pr-14 outline-none transition focus:ring-2 ${
              isPasswordTooShort
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-[#C9A04B] focus:ring-[#C9A04B]/20'
            }`}
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

        {/* Password Helper & Counter */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p
            className={`text-xs ${
              isPasswordTooShort
                ? 'text-red-500 font-medium'
                : 'text-gray-500'
            }`}
          >
            {isPasswordTooShort
              ? 'Must be at least 8 characters long'
              : 'Password must be at least 8 characters.'}
          </p>

          <span
            className={`text-xs font-medium ${
              password.trim().length >= MIN_PASSWORD_LENGTH
                ? 'text-green-600'
                : isPasswordTooShort
                  ? 'text-red-500'
                  : 'text-gray-500'
            }`}
          >
            {password.trim().length} / {MIN_PASSWORD_LENGTH}
          </span>
        </div>

        {/* General Error Message */}
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
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
