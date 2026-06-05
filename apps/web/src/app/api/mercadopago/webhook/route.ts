import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MercadoPago envía la notificación con query params
    const type = request.nextUrl.searchParams.get('type')
    const id = request.nextUrl.searchParams.get('id')

    if (type === 'payment') {
      // Obtener detalles del pago de MercadoPago
      // Por ahora, solo marcar orden como pagada
      // En producción, verificar con MercadoPago API

      const paymentData = body

      if (paymentData.status === 'approved') {
        // Actualizar orden como pagada
        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentData.external_reference)
      }
    }

    return NextResponse.json({ status: 'received' })
  } catch (error) {
    console.error('Error processing MP webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
