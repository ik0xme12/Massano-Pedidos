'use client'

import { useOrderReviews } from '@/hooks/use-reviews'
import { Star } from 'lucide-react'

interface ReviewsListProps {
  orderId: string
}

export function ReviewsList({ orderId }: ReviewsListProps) {
  const { reviews, loading } = useOrderReviews(orderId)

  if (loading) {
    return <p className="text-muted-foreground text-sm">Cargando reseñas...</p>
  }

  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-sm">No hay reseñas aún</p>
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(averageRating) ? 'fill-gold text-gold' : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({reviews.length} reseñas)</span>
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating ? 'fill-gold text-gold' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at || '').toLocaleDateString('es-AR')}
              </span>
            </div>
            {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
