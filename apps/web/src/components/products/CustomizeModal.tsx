'use client'

import { useState } from 'react'
import { Button } from '@/components/ds'
import { X } from 'lucide-react'

export interface ProductCustomization {
  size?: 'chico' | 'mediano' | 'grande'
  temperature?: 'caliente' | 'helado'
  sugar?: boolean
  mayonnaise?: boolean
  notes?: string
}

interface CustomizeModalProps {
  isOpen: boolean
  productName: string
  productCategory?: string
  onClose: () => void
  onConfirm: (customization: ProductCustomization) => void
}

export function CustomizeModal({
  isOpen,
  productName,
  productCategory = '',
  onClose,
  onConfirm,
}: CustomizeModalProps) {
  const [customization, setCustomization] = useState<ProductCustomization>({})

  const isCoffee = productCategory?.toLowerCase() === 'bebidas' || productName.toLowerCase().includes('café')
  const isSandwich = productCategory?.toLowerCase() === 'sándwiches' || productName.toLowerCase().includes('sándwich')

  const handleConfirm = () => {
    onConfirm(customization)
    setCustomization({})
  }

  const handleClose = () => {
    setCustomization({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Personalizar {productName}</h2>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Café Options */}
          {isCoffee && (
            <>
              {/* Tamaño */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">Tamaño</label>
                <div className="space-y-2">
                  {(['chico', 'mediano', 'grande'] as const).map((size) => (
                    <label key={size} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={customization.size === size}
                        onChange={(e) => setCustomization({ ...customization, size: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Temperatura */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">Temperatura</label>
                <div className="space-y-2">
                  {(['caliente', 'helado'] as const).map((temp) => (
                    <label key={temp} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="temperature"
                        value={temp}
                        checked={customization.temperature === temp}
                        onChange={(e) => setCustomization({ ...customization, temperature: e.target.value as any })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm capitalize">{temp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Azúcar */}
              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">Azúcar</label>
                <div className="space-y-2">
                  {[
                    { label: 'Con azúcar', value: true },
                    { label: 'Sin azúcar', value: false },
                  ].map(({ label, value }) => (
                    <label key={String(value)} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="sugar"
                        value={String(value)}
                        checked={customization.sugar === value}
                        onChange={() => setCustomization({ ...customization, sugar: value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sándwich Options */}
          {isSandwich && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-3">Mayonesa</label>
              <div className="space-y-2">
                {[
                  { label: 'Con mayonesa', value: true },
                  { label: 'Sin mayonesa', value: false },
                ].map(({ label, value }) => (
                  <label key={String(value)} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="mayonnaise"
                      value={String(value)}
                      checked={customization.mayonnaise === value}
                      onChange={() => setCustomization({ ...customization, mayonnaise: value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">Notas adicionales (opcional)</label>
            <textarea
              value={customization.notes || ''}
              onChange={(e) => setCustomization({ ...customization, notes: e.target.value })}
              placeholder="Ej: Sin gluten, sin lactosa, picante..."
              className="w-full px-4 py-3 text-sm border border-border rounded-lg outline-none resize-none focus:border-gold transition-colors"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="black" className="flex-1" onClick={handleConfirm}>
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
