import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/useCart'

function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
  if (!id) {
    return
  }

    let cancelled = false

    async function fetchProduct() {
      try {
        const response = await fetch(
      `https://dummyjson.com/products/${encodeURIComponent(id!)}`,
        )

        if (!response.ok) {
          throw new Error('Product not found')
        }

        const data: Product = await response.json()

        if (!cancelled) {
          setProduct(data)
          setError('')
        }
      } catch {
        if (!cancelled) {
          setError('Could not load the product.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchProduct()

    return () => {
      cancelled = true
    }
  }, [id])

  function handleAddToCart() {
    if (!product) return

    addToCart(product)
    setAdded(true)
  }

  if (loading) {
    return <p className="p-8 text-center">Loading product...</p>
  }

  if (error || !product) {
    return (
      <main className="px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Product not found
        </h1>

        <p className="mt-3 text-gray-600">
          {error || 'This product is unavailable.'}
        </p>

        <Link to="/" className="mt-5 inline-block text-blue-600">
          Back to catalog
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="flex min-h-80 items-center justify-center rounded-2xl bg-white p-6">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="max-h-96 w-full object-contain"
        />
      </div>

      <section>
        <p className="text-sm capitalize text-gray-500">
          {product.category}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          {product.title}
        </h1>

        <p className="mt-4 text-amber-500">
          ★ {product.rating} / 5
        </p>

        <p className="mt-6 text-3xl font-bold text-blue-600">
          ${product.price.toFixed(2)}
        </p>

        <p className="mt-6 leading-7 text-gray-600">
          {product.description}
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Stock available: {product.stock}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {product.stock <= 0
            ? 'Out of Stock'
            : added
              ? 'Add Another'
              : 'Add to Cart'}
        </button>

        {added && (
          <p className="mt-3 text-sm font-medium text-green-600">
            Product added to cart!
          </p>
        )}

        <div>
          <Link
            to="/cart"
            className="mt-4 inline-block text-blue-600 underline"
          >
            View Cart
          </Link>
        </div>

        <Link
          to="/"
          className="mt-4 inline-block text-gray-600 hover:text-blue-600"
        >
          ← Back to Products
        </Link>
      </section>
    </main>
  )
}

export default ProductDetails