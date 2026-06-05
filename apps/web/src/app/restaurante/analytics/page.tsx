'use client'

import { useEffect, useState } from 'react'
import { analyticsService } from '@/lib/analytics-service'
import { formatPrice } from '@/lib/utils'
import { MassanoLogo } from '@/components/brand/MassanoLogo'
import { Button } from '@/components/ds'
import { ArrowLeft, TrendingUp, ShoppingCart, CheckCircle, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalOrders: number
  totalRevenue: number
  completedOrders: number
  avgOrderValue: number
  pendingOrders: number
}

interface RevenueDay {
  date: string
  revenue: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [revenue, setRevenue] = useState<RevenueDay[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30 | 90>(7)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, revenueData] = await Promise.all([
          analyticsService.getOrderStats(),
          analyticsService.getRevenueByDay(period),
        ])

        setStats(statsData)
        setRevenue(revenueData)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando analytics...</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue), 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MassanoLogo variant="dark" size="xs" />
            <span className="text-sm text-muted-foreground">Analytics</span>
          </div>
          <Link href="/restaurante">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-brand-black text-white'
                  : 'bg-muted text-foreground hover:bg-muted-dark'
              }`}
            >
              {p} días
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ingresos Totales</span>
              <DollarSign className="h-5 w-5 text-gold" />
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">
              Promedio: {formatPrice(stats.avgOrderValue)}
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Órdenes Totales</span>
              <ShoppingCart className="h-5 w-5 text-gold" />
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">
              Pendientes: {stats.pendingOrders}
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entregadas</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.completedOrders}</p>
            <p className="text-xs text-muted-foreground">
              Tasa: {((stats.completedOrders / stats.totalOrders) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ticket Promedio</span>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground">Por orden</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold mb-6">Ingresos por Día</h2>

          {revenue.length > 0 ? (
            <div className="space-y-4">
              {revenue.map((day) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{day.date}</span>
                    <span className="font-semibold">{formatPrice(day.revenue * 100)}</span>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin datos para este período</p>
          )}
        </div>
      </main>
    </div>
  )
}
