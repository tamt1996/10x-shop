
import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/products/${product.id}`}
        className="block"
      >
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-56 w-full bg-gray-50 object-contain p-4"
        />

        <div className="p-5">
          <p className="text-sm capitalize text-gray-500">
            {product.category}
          </p>

          <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold text-gray-900">
            {product.title}
          </h3>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>

            <span className="text-sm text-amber-500">
              ★ {product.rating}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default ProductCard
