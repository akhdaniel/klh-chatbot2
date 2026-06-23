import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: number | string
  username: string
  display_name?: string
  role: 'admin' | 'staff' | 'viewer'
  avatar_initials?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, displayName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      setToken(savedToken)
      // In a real app, verify token with backend
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch('https://bff.xerpium.com/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login gagal')
      }

      const data = await response.json()
      const newToken = data.token

      localStorage.setItem('authToken', newToken)
      setToken(newToken)
      setUser(data.user || { id: '', username, role: 'staff' })
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (username: string, password: string, displayName: string) => {
    try {
      setLoading(true)

      // Validation
      if (username.length < 3) throw new Error('Username minimal 3 karakter')
      if (password.length < 6) throw new Error('Password minimal 6 karakter')
      if (!displayName.trim()) throw new Error('Nama tampilan diperlukan')

      const response = await fetch('https://bff.xerpium.com/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name: displayName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Signup gagal')
      }

      const data = await response.json()
      const newToken = data.token

      localStorage.setItem('authToken', newToken)
      setToken(newToken)
      setUser(data.user)
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
