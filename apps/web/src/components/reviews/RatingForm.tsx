'use client'

import { useState } from 'react'
import { useLeaveReview } from '@/hooks/use-reviews'
import { Button } from '@/components/ds'
import { Star } from 'lucide-react'

interface RatingFormProps {
  orderId: string
  userId: string
  onSuccess?: () => void
}

export function RatingForm({ orderId, userId, onSuccess }: RatingFormProps) {
  const { submitReview, loading } = useLeaveReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    try {
      await submitReview(orderId, userId, rating, comment || undefined)
      setSubmitted(true)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-gold font-semibold mb-2">✓ Gracias por tu reseña</p>
        <p className="text-sm text-muted-foreground">Tu opinión nos ayuda a mejorar</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-3">¿Cómo fue tu experiencia?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-gold text-gold'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comentario (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos más sobre tu experiencia..."
          className="w-full px-4 py-3 text-sm border border-border rounded-lg outline-none focus:border-gold transition-colors resize-none"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        variant="black"
        size="lg"
        className="w-full"
        disabled={rating === 0 || loading}
        loading={loading}
      >
        Enviar Reseña
      </Button>
    </form>
  )
}
