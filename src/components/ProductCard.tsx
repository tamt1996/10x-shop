import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onDelete?: (id: number) => void // <--- ეს ხაზია აუცილებელი
}

function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Link to={`/products/${product.id}`} className="block">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-56 w-full bg-gray-50 object-contain p-4"
        />
      </Link>

      <div className="p-5">
        <p className="text-sm capitalize text-gray-500">
          {product.category}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold text-gray-900">
          {product.title}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard