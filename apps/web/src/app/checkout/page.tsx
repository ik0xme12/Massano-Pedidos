"use client"

import { useCartStore } from "@/store/cart"
import { useSaveOrder } from "@/hooks/use-orders"
import { useAuth } from "@/contexts/auth-context"
import { useLoginModal } from "@/hooks/use-login-modal"
import { useMercadoPago } from "@/hooks/use-mercadopago"
import { formatPrice } from "@/lib/utils"
import { MassanoLogo } from "@/components/brand/MassanoLogo"
import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ds"
import { ArrowLeft, Banknote, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type PaymentMethod = "mercadopago" | "cash" | "transfer"

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "mercadopago", label: "MercadoPago", icon: <Smartphone className="h-5 w-5" /> },
  { id: "cash",        label: "Efectivo al entregar", icon: <Banknote className="h-5 w-5" /> },
  { id: "transfer",    label: "Transferencia bancaria", icon: <CreditCard className="h-5 w-5" /> },
]

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCartStore()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const loginModal = useLoginModal()
  const { saveOrder, loading: orderLoading } = useSaveOrder()
  const { createAndOpenCheckout, loading: mpLoading } = useMercadoPago()
  const [payment, setPayment] = useState<PaymentMethod>("mercadopago")
  const [address, setAddress] = useState("")
  const [notes, setNotes]     = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      loginModal.open()
    }
  }, [user, authLoading, loginModal])

  const subtotal = totalPrice()
  const delivery = 600
  const total    = subtotal + delivery

  async function handleConfirm() {
    if (!address.trim()) return
    setError(null)

    try {
      // First, save the order to get ID
      const order = await saveOrder(address, payment, items, notes)

      // If MercadoPago, open checkout
      if (payment === "mercadopago" && user) {
        await createAndOpenCheckout(order.id, total, user.email || "")
        // Payment will redirect via callback URLs
      } else {
        // For cash/transfer, go directly to confirmation
        clear()
        router.push(`/pedido-confirmado?id=${order.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el pedido")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">Necesitás ingresar para continuar.</p>
        <LoginModal
          isOpen={loginModal.isOpen}
          onClose={loginModal.close}
          onSuccess={() => {
            // Ya el componente se re-renderizará con el usuario
          }}
        />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">No tenés productos en el carrito.</p>
        <Link href="/">
          <Button variant="black">Volver al menú</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-5 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg font-semibold">Confirmá tu pedido</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 space-y-6">

        {/* Resumen de productos */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Tu pedido
          </h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                {product.image_url && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={product.image_url}
                      alt={product.name || "Product"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">×{quantity}</p>
                </div>
                <p className="text-sm font-semibold flex-shrink-0">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dirección de entrega */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Dirección de entrega
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Ej: Av. Corrientes 1234, CABA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <textarea
            placeholder="Notas para el repartidor (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-2 w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none resize-none placeholder:text-muted-foreground focus:border-gold transition-colors"
          />
        </section>

        {/* Método de pago */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Método de pago
          </h2>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPayment(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  payment === opt.id
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-border bg-card hover:border-brand-black/40"
                }`}
              >
                {opt.icon}
                <span className="text-sm font-medium">{opt.label}</span>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  payment === opt.id ? "border-white" : "border-muted-foreground"
                }`}>
                  {payment === opt.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Resumen de precios */}
        <section className="bg-card border border-border rounded-xl px-4 py-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Envío</span>
            <span>{formatPrice(delivery)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </section>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* CTA */}
        <Button
          variant="black"
          size="xl"
          className="w-full"
          onClick={handleConfirm}
          loading={orderLoading || mpLoading}
          disabled={!address.trim() || orderLoading || mpLoading}
        >
          {orderLoading ? "Guardando pedido..." : mpLoading ? "Abriendo MercadoPago..." : `Confirmar · ${formatPrice(total)}`}
        </Button>

        <div className="flex justify-center pb-8">
          <MassanoLogo variant="dark" size="xs" />
        </div>
      </main>
    </div>
  )
}
