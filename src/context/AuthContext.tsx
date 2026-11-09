
import {
  useState,
  type ReactNode,
} from 'react'

import { AuthContext } from './AuthContextValue'

const MIN_PASSWORD_LENGTH = 8

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
}

export interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

function getStoredUser(): AuthUser | null {
  try {
    const savedUser = localStorage.getItem('shop_user')

    if (!savedUser) {
      return null
    }

    const parsedUser: unknown = JSON.parse(savedUser)

    if (
      typeof parsedUser !== 'object' ||
      parsedUser === null ||
      !('id' in parsedUser) ||
      !('username' in parsedUser)
    ) {
      return null
    }

    return parsedUser as AuthUser
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  function login(username: string, password: string): boolean {
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    if (!cleanUsername || cleanPassword.length < MIN_PASSWORD_LENGTH) {
      return false
    }

    const newUser: AuthUser = {
      id: Date.now(),
      username: cleanUsername,
      email: `${cleanUsername}@10xshop.local`,
      firstName: cleanUsername,
      lastName: '',
      image: '',
    }

    localStorage.setItem('shop_user', JSON.stringify(newUser))
    setUser(newUser)

    return true
  }

  function logout() {
    // 1. ვშლით მომხმარებლის ავტორიზაციის მონაცემებს
    localStorage.removeItem('shop_user')
    localStorage.removeItem('shop_access_token')
    localStorage.removeItem('shop_refresh_token')
    localStorage.removeItem('shop_profile')

    // 2. ვშლით კალათის მონაცემებს (რომ გამოსვლის შემდეგ კალათა არ დარჩეს)
    localStorage.removeItem('cart')
    localStorage.removeItem('shop_cart')
    localStorage.removeItem('cartItems')

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
