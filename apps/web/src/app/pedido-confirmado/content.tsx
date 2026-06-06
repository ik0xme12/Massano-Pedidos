'use client'

import Image from "next/image"
import { Button } from "@/components/ds"
import { CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function PedidoConfirmadoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-olive flex flex-col items-center justify-center px-5 text-white">
      <div className="max-w-sm w-full text-center space-y-6">
        <Image
          src="/massano5.png"
          alt="Massano Cafetería"
          width={220}
          height={80}
          className="object-contain mx-auto"
          style={{
            filter: "brightness(0) saturate(100%) invert(1)",
          }}
        />

        <div className="flex items-center justify-center">
          <CheckCircle className="h-16 w-16 text-gold" strokeWidth={1.5} />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold mb-2">
            ¡Pedido confirmado!
          </h1>
          <p className="text-white/70 text-base">
            Recibimos tu pedido y ya lo estamos preparando.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-gold flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium">Tiempo estimado</p>
            <p className="text-gold font-semibold">20 – 35 minutos</p>
          </div>
        </div>

        <div className="space-y-3">
          {orderId && (
            <Link href={`/pedido/${orderId}`}>
              <Button variant="gold" size="lg" className="w-full">
                Ver estado del pedido
              </Button>
            </Link>
          )}
          <Link href="/mis-pedidos">
            <Button variant="outline" size="lg" className="w-full border-white text-white hover:bg-white/10">
              Mis pedidos
            </Button>
          </Link>
          <Link href="/">
            <Button variant="gold" size="lg" className="w-full" style={{ opacity: 0.7 }}>
              Volver al menú
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
