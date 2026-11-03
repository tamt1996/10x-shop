import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CartItem, CheckoutFormFields } from '../types'

interface Order {
  id: number
  customer: CheckoutFormFields
  items: CartItem[]
  total: number
  createdAt: string
}

function loadOrders(): Order[] {
  try {
    const savedOrders = localStorage.getItem('shop_orders')

    if (!savedOrders) {
      return []
    }

    const parsed: unknown = JSON.parse(savedOrders)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as Order[]
  } catch {
    return []
  }
}

function Orders() {
  const [orders] = useState<Order[]>(loadOrders)

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        My Orders
      </h1>

      <p className="mt-2 text-gray-600">
        View your order history and order details.
      </p>

      {orders.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No orders yet
          </h2>

          <p className="mt-3 text-gray-600">
            Your completed orders will appear here.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <div className="mt-8 space-y-6">
          {[...orders].reverse().map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-gray-200 pb-4 sm:flex-row">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order #{order.id}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <p className="font-bold text-blue-600">
                  ${order.total.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      className="h-16 w-16 rounded-lg bg-gray-50 object-contain p-1"
                    />

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900">
                  Delivery details
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {order.customer.fullName}
                </p>

                <p className="text-sm text-gray-600">
                  {order.customer.email}
                </p>

                <p className="text-sm text-gray-600">
                  {order.customer.address}, {order.customer.city}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default Orders