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

  // Verify token and restore session on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('authToken')
      
      if (!savedToken) {
        setLoading(false)
        return
      }

      try {
        // Verify token with backend /api/auth/me endpoint
        const response = await fetch('https://bff.xerpium.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.ok && result.data) {
            setToken(savedToken)
            setUser(result.data)
          } else {
            // Token invalid or expired
            localStorage.removeItem('authToken')
            setToken(null)
            setUser(null)
          }
        } else if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
        } else {
          // Other error, keep token but mark as logged out
          localStorage.removeItem('authToken')
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        console.error('Token verification failed:', err)
        // Network error - could be temporary, but clear token to be safe
        localStorage.removeItem('authToken')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
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

      const result = await response.json()
      const newToken = result.data?.token
      const userData = result.data?.user

      if (!newToken) {
        throw new Error('Token tidak ditemukan dalam response')
      }

      localStorage.setItem('authToken', newToken)
      setToken(newToken)
      setUser(userData || { id: '', username, role: 'staff' })
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

      const result = await response.json()
      const newToken = result.data?.token
      const userData = result.data?.user

      if (!newToken) {
        throw new Error('Token tidak ditemukan dalam response')
      }

      localStorage.setItem('authToken', newToken)
      setToken(newToken)
      setUser(userData)
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
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token && !!user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
