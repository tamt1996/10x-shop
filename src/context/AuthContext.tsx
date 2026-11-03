import {
  useState,
  type ReactNode,
} from 'react'

import { AuthContext } from './AuthContextValue'

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

    return savedUser ? (JSON.parse(savedUser) as AuthUser) : null
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

    if (!cleanUsername || !cleanPassword) {
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
    localStorage.removeItem('shop_user')
    localStorage.removeItem('shop_access_token')
    localStorage.removeItem('shop_refresh_token')
    localStorage.removeItem('shop_profile')

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