'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { LogOut, TrendingUp, Package, Users, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminStats {
  totalOrders: number
  totalRevenue: number
  totalRestaurants: number
  totalUsers: number
  pendingReviews: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/')
          return
        }

        // TODO: Verificar si el usuario es admin en la BD
        // Por ahora, permitir acceso (en producción usar RLS)
        setIsAdmin(true)

        // Cargar estadísticas
        const [orders, restaurants, profiles, reviews] = await Promise.all([
          supabase.from('orders').select('total, status', { count: 'exact' }),
          supabase.from('restaurants').select('id', { count: 'exact' }),
          supabase.from('auth.users').select('id', { count: 'exact' }),
          supabase.from('reviews').select('id', { count: 'exact' }),
        ])

        const totalRevenue = (orders.data || []).reduce((sum, o: any) => sum + o.total, 0)
        const totalOrders = orders.count || 0
        const totalRestaurants = restaurants.count || 0
        const totalUsers = profiles.count || 0
        const pendingReviews = reviews.count || 0

        setStats({
          totalOrders,
          totalRevenue,
          totalRestaurants,
          totalUsers,
          pendingReviews,
        })
      } catch (error) {
        console.error('Error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MassanoLogo variant="dark" size="xs" />
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Ingresos Totales</span>
              <TrendingUp className="h-4 w-4 text-gold" />
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Órdenes</span>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Restaurantes</span>
              <span className="h-4 w-4 text-emerald-600">🏪</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalRestaurants || 0}</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Usuarios</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Reseñas</span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">{stats?.pendingReviews || 0}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="black" className="w-full justify-center">
            📊 Ver Órdenes
          </Button>
          <Button variant="black" className="w-full justify-center">
            🏪 Gestionar Restaurantes
          </Button>
          <Button variant="black" className="w-full justify-center">
            ⭐ Moderar Reseñas
          </Button>
        </div>

        {/* TODO Section */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="font-display font-bold text-base text-amber-900 mb-4">
            Funcionalidades Pendientes
          </h2>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>✓ Dashboard de estadísticas globales</li>
            <li>□ Tabla de órdenes con filtros y búsqueda</li>
            <li>□ Gestión de restaurantes (crear, editar, deshabilitar)</li>
            <li>□ Moderar y eliminar reseñas inapropiadas</li>
            <li>□ Analytics avanzado (gráficos, tendencias)</li>
            <li>□ Gestión de usuarios (roles, permisos)</li>
            <li>□ Reportes exportables (PDF, CSV)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
