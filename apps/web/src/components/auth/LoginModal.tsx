'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ds'
import { X } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password, fullName)
      } else {
        await signIn(email, password)
      }
      setEmail('')
      setPassword('')
      setFullName('')
      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold">
            {isSignUp ? 'Crear cuenta' : 'Ingresar'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white outline-none focus:border-gold transition-colors"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="black"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {isSignUp ? 'Crear cuenta' : 'Ingresar'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? '¿Ya tenés cuenta? Ingresá aquí' : '¿No tenés cuenta? Creá una aquí'}
          </button>
        </form>
      </div>
    </div>
  )
}
