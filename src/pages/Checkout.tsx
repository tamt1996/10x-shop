
import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import type { CheckoutFormFields, CartItem } from '../types'

interface Order {
  id: number
  customer: CheckoutFormFields
  items: CartItem[]
  total: number
  createdAt: string
}

function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState<CheckoutFormFields>({
    fullName: '',
    email: '',
    address: '',
    city: '',
  })

  const [error, setError] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Your cart is empty. Add products before checkout.')
      return
    }

    const order: Order = {
      id: Date.now(),
      customer: form,
      items,
      total: totalPrice,
      createdAt: new Date().toISOString(),
    }

    try {
      const savedOrders = localStorage.getItem('shop_orders')
      let previousOrders: Order[] = []

      if (savedOrders) {
        const parsed: unknown = JSON.parse(savedOrders)

        if (Array.isArray(parsed)) {
          previousOrders = parsed as Order[]
        }
      }

      localStorage.setItem(
        'shop_orders',
        JSON.stringify([...previousOrders, order]),
      )

      clearCart()
      navigate('/', { state: { orderPlaced: true } })
    } catch {
      setError('Unable to save your order. Please try again.')
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-3 text-gray-600">
          Add some products before checking out.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Continue shopping
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <p className="mt-2 text-gray-600">
        Enter your details to complete your order.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
      >
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            autoComplete="street-address"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            autoComplete="address-level2"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-between border-t border-gray-200 pt-5">
          <span className="font-semibold text-gray-900">Order total</span>
          <span className="text-xl font-bold text-blue-600">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Place order
        </button>
      </form>
    </main>
  )
}

export default Checkout
