'use client'

import { useState } from 'react'
import { Button } from '@/components/ds'
import { X } from 'lucide-react'

export interface ProductCustomization {
  size?: 'chico' | 'grande'
  milkType?: 'entera' | 'sin-lactosa' | 'vegetal'
  extraShot?: boolean
  temperature?: 'caliente' | 'helado'
  sugar?: boolean
  mayonnaise?: boolean
  bases?: string[]
  protein?: string
  fruits?: string[]
  seeds?: string
  dressing?: string
  extras?: string[]
  notes?: string
}

interface CustomizeModalProps {
  isOpen: boolean
  productName: string
  productCategory?: string
  onClose: () => void
  onConfirm: (customization: ProductCustomization) => void
}

const BASES = ['Lechuga', 'Espinaca', 'Arúgula', 'Germen de alfalfa']
const PROTEINS = ['Pollo asado', 'Atún', 'Pasta + panela']
const FRUITS = ['Manzana', 'Zanahoria', 'Cherry', 'Aguacate', 'Fresa', 'Pera', 'Mango', 'Naranja', 'Pepino', 'Frutos rojos']
const SEEDS = ['Nuez', 'Arándanos', 'Ajonjolí']
const DRESSINGS = ['Miel mostaza', 'Cesar', 'Ranch', 'Italiano']
const EXTRAS = ['Proteína extra', 'Pasta', 'Panela', 'Vegetales', 'Crotones', 'Aderezo extra', 'Aceituna', 'Queso de cabra', 'Aceite de oliva', 'Reducción balsámico', 'Frutos rojos']
const MILK_TYPES = ['Entera', 'Sin lactosa', 'Vegetal']

export function CustomizeModal({
  isOpen,
  productName,
  productCategory = '',
  onClose,
  onConfirm,
}: CustomizeModalProps) {
  const [customization, setCustomization] = useState<ProductCustomization>({})
  const [saladStep, setSaladStep] = useState(1)

  const isCoffee = productCategory?.toLowerCase() === 'bebidas' || productName.toLowerCase().includes('café')
  const isBeverage = ['bebidas calientes', 'bebidas frías', 'frappes', 'bebidas de temporada'].some(cat => productCategory?.toLowerCase().includes(cat))
  const isSandwich = productCategory?.toLowerCase().includes('sándwich')
  const isSalad = productCategory?.toLowerCase().includes('ensalada')

  const handleConfirm = () => {
    onConfirm(customization)
    setCustomization({})
    setSaladStep(1)
  }

  const handleClose = () => {
    setCustomization({})
    setSaladStep(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Personalizar</h2>
            <p className="text-xs text-muted-foreground">{productName}</p>
            {isSalad && <p className="text-xs text-muted-foreground">Paso {saladStep}/5</p>}
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Bebidas: Tamaño */}
          {isBeverage && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-3">Tamaño</label>
              <div className="space-y-2">
                {(['chico', 'grande'] as const).map((size) => (
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
          )}

          {/* Bebidas: Tipo de Leche */}
          {isBeverage && (
            <div>
              <label className="text-sm font-semibold text-foreground block mb-3">Tipo de Leche</label>
              <div className="space-y-2">
                {MILK_TYPES.map((milk) => (
                  <label key={milk} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="milk"
                      value={milk.toLowerCase().replace(' ', '-')}
                      checked={customization.milkType === milk.toLowerCase().replace(' ', '-')}
                      onChange={(e) => setCustomization({ ...customization, milkType: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{milk}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bebidas: Shot extra */}
          {isBeverage && (
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={customization.extraShot || false}
                onChange={(e) => setCustomization({ ...customization, extraShot: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Carga extra (+27)</span>
            </label>
          )}

          {/* Café: Temperatura y Azúcar */}
          {isCoffee && !isBeverage && (
            <>
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

          {/* Sándwiches: Mayonesa */}
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

          {/* Ensaladas - Paso 1: Bases */}
          {isSalad && saladStep === 1 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Elige 1-2 bases</p>
              <div className="space-y-2">
                {BASES.map((base) => (
                  <label key={base} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.bases?.includes(base) || false}
                      onChange={(e) => {
                        const bases = customization.bases || []
                        if (e.target.checked && bases.length < 2) {
                          setCustomization({ ...customization, bases: [...bases, base] })
                        } else if (!e.target.checked) {
                          setCustomization({ ...customization, bases: bases.filter(b => b !== base) })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{base}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ensaladas - Paso 2: Proteína */}
          {isSalad && saladStep === 2 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Elige 1 proteína</p>
              <div className="space-y-2">
                {PROTEINS.map((prot) => (
                  <label key={prot} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="protein"
                      value={prot}
                      checked={customization.protein === prot}
                      onChange={() => setCustomization({ ...customization, protein: prot })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{prot}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ensaladas - Paso 3: Frutas */}
          {isSalad && saladStep === 3 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Elige 3 frutas o verduras</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {FRUITS.map((fruit) => (
                  <label key={fruit} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.fruits?.includes(fruit) || false}
                      onChange={(e) => {
                        const fruits = customization.fruits || []
                        if (e.target.checked && fruits.length < 3) {
                          setCustomization({ ...customization, fruits: [...fruits, fruit] })
                        } else if (!e.target.checked) {
                          setCustomization({ ...customization, fruits: fruits.filter(f => f !== fruit) })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{fruit}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ensaladas - Paso 4: Semillas */}
          {isSalad && saladStep === 4 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Elige 1 semilla</p>
              <div className="space-y-2">
                {SEEDS.map((seed) => (
                  <label key={seed} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="seed"
                      value={seed}
                      checked={customization.seeds === seed}
                      onChange={() => setCustomization({ ...customization, seeds: seed })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{seed}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Ensaladas - Paso 5: Aderezos y Extras */}
          {isSalad && saladStep === 5 && (
            <>
              <div>
                <p className="text-sm font-semibold mb-3">Aderezo</p>
                <div className="space-y-2">
                  {DRESSINGS.map((dr) => (
                    <label key={dr} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="dressing"
                        value={dr}
                        checked={customization.dressing === dr}
                        onChange={() => setCustomization({ ...customization, dressing: dr })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{dr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Extras (opcional)</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {EXTRAS.map((extra) => (
                    <label key={extra} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={customization.extras?.includes(extra) || false}
                        onChange={(e) => {
                          const extras = customization.extras || []
                          if (e.target.checked) {
                            setCustomization({ ...customization, extras: [...extras, extra] })
                          } else {
                            setCustomization({ ...customization, extras: extras.filter(ex => ex !== extra) })
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{extra}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notas */}
          {!isSalad && (
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
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border p-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancelar
          </Button>
          {isSalad ? (
            <>
              {saladStep > 1 && (
                <Button variant="outline" className="flex-1" onClick={() => setSaladStep(saladStep - 1)}>
                  Atrás
                </Button>
              )}
              {saladStep < 5 ? (
                <Button variant="black" className="flex-1" onClick={() => setSaladStep(saladStep + 1)}>
                  Siguiente
                </Button>
              ) : (
                <Button variant="black" className="flex-1" onClick={handleConfirm}>
                  Agregar
                </Button>
              )}
            </>
          ) : (
            <Button variant="black" className="flex-1" onClick={handleConfirm}>
              Agregar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
