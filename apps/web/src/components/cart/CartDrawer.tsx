"use client"

import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ds"
import Link from "next/link"
import Image from "next/image"

export function CartDrawer() {
  const { items, isOpen, closeCart, increment, decrement, remove, totalItems, totalPrice } =
    useCartStore()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card z-50 flex flex-col
          shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
            <p className="text-xs text-muted-foreground">
              {totalItems()} {totalItems() === 1 ? "producto" : "productos"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground px-8 text-center">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm">Agregá productos del menú para empezar tu pedido</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-4">
                  {/* Image */}
                  {product.image_url && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={product.image_url}
                        alt={product.name || "Product"}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => decrement(product.id)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      {quantity === 1
                        ? <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        : <Minus className="h-3.5 w-3.5" />
                      }
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => increment(product.id)}
                      className="w-7 h-7 rounded-full bg-brand-black text-white flex items-center justify-center hover:bg-brand-black/80 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5 space-y-3 bg-card">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span>{formatPrice(600)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg">{formatPrice(totalPrice() + 600)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block">
              <Button variant="black" size="lg" className="w-full">
                Confirmar pedido
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
