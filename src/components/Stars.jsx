import { Star } from 'lucide-react'
import { countReviews } from '../lib/format'

/** Неоновые звёздочки рейтинга + количество отзывов */
export default function Stars({ rating, reviews, big = false }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[1px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${big ? 'h-4 w-4' : 'h-3.5 w-3.5'} ${
              i <= Math.round(rating) ? 'text-star fill-star' : 'text-[#fdba74]/40 fill-[#fdba74]/40'
            }`}
          />
        ))}
      </div>
      <span className={`text-muted ${big ? 'text-[12px]' : 'text-[11px]'}`}>
        {countReviews(reviews)}
      </span>
    </div>
  )
}
