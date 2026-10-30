
import { useEffect, useState } from 'react'
import type { Product, ProductsResponse } from '../types'
import ProductCard from '../components/ProductCard'

interface ProductCategory {
  slug: string
  name: string
  url: string
}

const PRODUCTS_PER_PAGE = 12

function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('default')
  const [page, setPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)

  const skip = (page - 1) * PRODUCTS_PER_PAGE
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)

  const selectedCategoryIndex = categories.findIndex(
    (category) => category.slug === selectedCategory,
  )

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory,
  )

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCategories() {
      try {
        setCategoriesLoading(true)

        const response = await fetch(
          'https://dummyjson.com/products/categories',
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to load categories')
        }

        const data: ProductCategory[] = await response.json()

        setCategories(data)

        if (data.length > 0) {
          setSelectedCategory((current) => current || data[0].slug)
        } else {
          setError('No categories are available.')
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError('Categories could not be loaded. Please try again.')
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false)
        }
      }
    }

    fetchCategories()

    return () => controller.abort()
  }, [retryCount])

  useEffect(() => {
    if (categoriesLoading || (!selectedCategory && !search.trim())) {
      return
    }

    const controller = new AbortController()

    async function fetchProducts() {
      try {
        setLoading(true)
        setError('')

        let endpoint: string

        if (search.trim()) {
          endpoint = `https://dummyjson.com/products/search?q=${encodeURIComponent(
            search.trim(),
          )}&limit=${PRODUCTS_PER_PAGE}&skip=${skip}`
        } else {
          endpoint = `https://dummyjson.com/products/category/${encodeURIComponent(
            selectedCategory,
          )}?limit=${PRODUCTS_PER_PAGE}&skip=${skip}`
        }

        if (sortOrder === 'price-low') {
          endpoint += '&sortBy=price&order=asc'
        } else if (sortOrder === 'price-high') {
          endpoint += '&sortBy=price&order=desc'
        } else if (sortOrder === 'name') {
          endpoint += '&sortBy=title&order=asc'
        }

        const response = await fetch(endpoint, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        const data: ProductsResponse = await response.json()

        setProducts(data.products)
        setTotal(data.total)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError('Products could not be loaded. Please try again.')
        setProducts([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => controller.abort()
    }, [
    categoriesLoading,
    selectedCategory,
    search,
    sortOrder,
    page,
    skip,
    retryCount,
  ])
  function handleCategoryChange(value: string) {
    setSelectedCategory(value)
    setSearch('')
    setPage(1)
  }

  function goToCategory(index: number) {
    if (index < 0 || index >= categories.length) return

    setSelectedCategory(categories[index].slug)
    setSearch('')
    setPage(1)

    document.getElementById('products')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSortOrder(value)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSortOrder('default')
    setPage(1)

    if (categories.length > 0) {
      setSelectedCategory(categories[0].slug)
    }
  }

  const displayedCategoryNumber =
    selectedCategoryIndex >= 0 ? selectedCategoryIndex + 1 : 0

  return (
    <main className="min-h-screen bg-[#F3EEE6]">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="home-hero grid min-h-[300px] items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-16">
          <div className="relative z-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#956D27]">
              Premium quality · Everyday essentials
            </p>

            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discover the Best Products for You
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#62594D] sm:text-lg">
              Explore quality products, discover new favorites and find
              everything you need in one place.
            </p>

            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#C9A04B] px-6 py-3.5 font-semibold text-[#17130A] shadow-sm transition hover:bg-[#E4C47A]"
            >
              Explore products
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <div className="flex h-64 w-64 items-center justify-center rounded-full border border-[#C9A04B]/40 bg-white/40 shadow-inner">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border border-[#C9A04B]/50 bg-[#F8F2E8]">
                <span className="text-center text-5xl font-semibold tracking-tight text-[#C9A04B]">
                  10X
                  <span className="mt-2 block text-lg tracking-[0.25em] text-[#25211B]">
                    SHOP
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="scroll-mt-8 py-12 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9A7025]">
                The collection
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-[#24221F] sm:text-4xl">
                Our Products
              </h2>

              <p className="mt-2 text-sm text-[#777168]">
                {search.trim()
                  ? `Search results for "${search.trim()}"`
                  : activeCategory
                    ? `${activeCategory.name} collection`
                    : 'Explore our collections.'}
              </p>
            </div>

            {!loading && !error && (
              <span className="rounded-full border border-[#E0D5C5] bg-white px-4 py-2 text-sm text-[#62594D]">
                {total} products
              </span>
            )}
          </div>

          <div className="filter-panel">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="product-search"
                  className="mb-2 block text-base font-bold text-[#38332B]"
                >
                  Search products
                </label>

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search by product name..."
                  className="w-full rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-base font-bold text-[#38332B]"
                >
                  Category
                </label>

                <select
                  id="product-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-sort"
                  className="mb-2 block text-base font-bold text-[#38332B]"
                >
                  Sort by
                </label>

                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) => handleSortChange(event.target.value)}
                  className="w-full rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
                >
                  <option value="default">Default order</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {(search || sortOrder !== 'default') && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-[#956D27] transition hover:text-[#5F4518]"
              >
                Clear filters ×
              </button>
            )}
          </div>

          {!search.trim() && categories.length > 0 && (
            <section className="mt-6 rounded-2xl border border-[#E3D8C6] bg-white/70 p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9A7025]">
                    Shop by category
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-[#24221F]">
                    {activeCategory?.name ?? 'Choose a category'}
                  </h3>
                </div>

                <span className="text-sm text-[#777168]">
                  Category {displayedCategoryNumber} of {categories.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => goToCategory(index)}
                    aria-pressed={selectedCategory === category.slug}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedCategory === category.slug
                        ? 'border-[#C9A04B] bg-[#C9A04B] text-black'
                        : 'border-[#D9D0C3] bg-white text-[#38332B] hover:border-[#C9A04B]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E0D4] pt-4">
                <button
                  type="button"
                  disabled={selectedCategoryIndex <= 0}
                  onClick={() => goToCategory(selectedCategoryIndex - 1)}
                  className="rounded-lg border border-[#D9D0C3] bg-white px-4 py-2 text-sm font-semibold text-[#38332B] hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous category
                </button>

                <span className="text-sm text-[#777168]">
                  {displayedCategoryNumber} / {categories.length}
                </span>

                <button
                  type="button"
                  disabled={selectedCategoryIndex < 0 || selectedCategoryIndex >= categories.length - 1}
                  onClick={() => goToCategory(selectedCategoryIndex + 1)}
                  className="rounded-lg border border-[#D9D0C3] bg-white px-4 py-2 text-sm font-semibold text-[#38332B] hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next category →
                </button>
              </div>
            </section>
          )}

          {loading && (
            <div className="mt-6 rounded-2xl border border-[#E7DFD3] bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#E8DDC8] border-t-[#C9A04B]" />
              <p className="text-[#777168]">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-white p-6 text-center">
              <p className="text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 rounded-lg bg-[#C9A04B] px-5 py-2.5 font-semibold text-black hover:bg-[#E4C47A]"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <p className="mt-5 text-sm text-[#777168]">
              Showing {products.length} products · Page {page} of{' '}
              {Math.max(totalPages, 1)}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#E7DFD3] bg-white px-6 py-16 text-center">
              <p className="text-lg font-semibold text-[#24221F]">
                No products found
              </p>

              <p className="mt-2 text-sm text-[#777168]">
                Try another search or change your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-[#C9A04B] px-5 py-3 font-semibold text-black hover:bg-[#E4C47A]"
              >
                Show category products
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Product pages"
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={page === 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-[#D9D0C3] bg-white px-4 py-2 text-sm font-semibold text-[#38332B] transition hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-current={pageNumber === page ? 'page' : undefined}
                        onClick={() => setPage(pageNumber)}
                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition ${
                          pageNumber === page
                            ? 'border-[#C9A04B] bg-[#C9A04B] text-black'
                            : 'border-[#D9D0C3] bg-white text-[#38332B] hover:border-[#C9A04B]'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-[#D9D0C3] bg-white px-4 py-2 text-sm font-semibold text-[#38332B] transition hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Home
