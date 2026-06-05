import { Suspense } from 'react'
import { PedidoConfirmadoContent } from './content'

export default function PedidoConfirmado() {
  return (
    <Suspense>
      <PedidoConfirmadoContent />
    </Suspense>
  )
}
