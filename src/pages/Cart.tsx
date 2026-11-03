
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'

function Cart() {
  const { items, totalPrice, removeFromCart, setQuantity } = useCart()

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg text-gray-600">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <article
                key={item.product.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <img
                  src={item.product.thumbnail}
                  alt={item.product.title}
                  className="h-28 w-full rounded-xl bg-gray-50 object-contain p-2 sm:w-28"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">
                    {item.product.title}
                  </h2>

                  <p className="mt-2 font-bold text-blue-600">
                    ${item.product.price.toFixed(2)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label
                      htmlFor={`quantity-${item.product.id}`}
                      className="text-sm text-gray-600"
                    >
                      Quantity:
                    </label>

                    <input
                      id={`quantity-${item.product.id}`}
                      type="number"
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(event) => {
                        const value = Number(event.target.value)

                        if (
                          Number.isInteger(value) &&
                          value >= 1 &&
                          value <= item.product.stock
                        ) {
                          setQuantity(item.product.id, value)
                        }
                      }}
                      className="w-20 rounded-lg border border-gray-300 px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="font-bold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between gap-4 text-gray-600">
              <span>Items</span>
              <span>
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <div className="mt-4 flex justify-between gap-4 border-t border-gray-200 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-6 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/"
              className="mt-4 block text-center text-sm text-gray-600 hover:text-blue-600"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Cart
