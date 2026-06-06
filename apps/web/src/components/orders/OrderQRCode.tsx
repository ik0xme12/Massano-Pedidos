'use client'

import { QRCodeSVG } from 'qrcode.react'

interface OrderQRCodeProps {
  orderId: string
  size?: number
}

export function OrderQRCode({ orderId, size = 200 }: OrderQRCodeProps) {
  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/pedido/${orderId}`

  const handleDownload = () => {
    const qr = document.getElementById(`qr-${orderId}`) as any
    if (qr) {
      const svgElement = qr.querySelector('svg')
      if (svgElement) {
        const svg = new XMLSerializer().serializeToString(svgElement)
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `pedido-${orderId}.svg`
        link.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-lg border border-border">
        <QRCodeSVG
          id={`qr-${orderId}`}
          value={trackingUrl}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#0a0a0a"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Escanea para hacer seguimiento de tu pedido
      </p>
      <button
        onClick={handleDownload}
        className="text-xs font-medium text-gold hover:text-gold/80 transition-colors"
      >
        Descargar QR
      </button>
    </div>
  )
}
