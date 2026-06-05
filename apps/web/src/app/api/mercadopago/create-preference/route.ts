import { NextRequest, NextResponse } from 'next/server'

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const { orderId, total, email, description } = await request.json()

    if (!orderId || !total || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: orderId,
            title: description,
            quantity: 1,
            unit_price: total / 100, // MercadoPago expects pesos sin centavos
            currency_id: 'ARS',
          },
        ],
        payer: {
          email,
        },
        back_urls: {
          success: `${APP_URL}/pedido-confirmado?mp_success=true&order_id=${orderId}`,
          failure: `${APP_URL}/checkout?mp_failure=true&order_id=${orderId}`,
          pending: `${APP_URL}/checkout?mp_pending=true&order_id=${orderId}`,
        },
        notification_url: `${APP_URL}/api/mercadopago/webhook`,
        auto_return: 'approved',
        expires: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(JSON.stringify(error))
    }

    const preference = await response.json()

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
    })
  } catch (error) {
    console.error('Error creating MP preference:', error)
    return NextResponse.json(
      { error: 'Failed to create preference' },
      { status: 500 }
    )
  }
}
