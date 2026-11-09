
import { useEffect, useState, type FormEvent } from 'react'
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

  // ლოკალური პროდუქტები
  const [customProducts, setCustomProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('custom_products')
    return saved ? JSON.parse(saved) : []
  })

  // წაშლილი პროდუქტების ID-ები
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('deleted_product_ids')
    return saved ? JSON.parse(saved) : []
  })

  // ახალი პროდუქტის დამატების მოდალი
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newImage, setNewImage] = useState('')

  // LocalStorage-ში შენახვა
  useEffect(() => {
    localStorage.setItem(
      'custom_products',
      JSON.stringify(customProducts),
    )
  }, [customProducts])

  useEffect(() => {
    localStorage.setItem(
      'deleted_product_ids',
      JSON.stringify(deletedIds),
    )
  }, [deletedIds])

  const skip = (page - 1) * PRODUCTS_PER_PAGE
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)

  const selectedCategoryIndex = categories.findIndex(
    (category) => category.slug === selectedCategory,
  )

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory,
  )

  // კატეგორიების წამოღება API-დან
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

  // პროდუქტების წამოღება API-დან
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

        // API პროდუქტების გაფილტვრა
        const apiFiltered = data.products.filter(
          (product) => !deletedIds.includes(product.id),
        )

        // მომხმარებლის დამატებული პროდუქტები
        const userAddedFiltered = customProducts.filter(
          (product) =>
            !deletedIds.includes(product.id) &&
            (!selectedCategory ||
              search.trim() ||
              product.category === selectedCategory) &&
            (!search.trim() ||
              product.title
                .toLowerCase()
                .includes(search.trim().toLowerCase())),
        )

        // პროდუქტების გაერთიანება
        const combinedProducts = [
          ...userAddedFiltered,
          ...apiFiltered,
        ]

        // დალაგება
        if (sortOrder === 'price-low') {
          combinedProducts.sort((a, b) => a.price - b.price)
        } else if (sortOrder === 'price-high') {
          combinedProducts.sort((a, b) => b.price - a.price)
        } else if (sortOrder === 'name') {
          combinedProducts.sort((a, b) =>
            a.title.localeCompare(b.title),
          )
        }

        setProducts(combinedProducts)

        const filteredTotal =
          data.total + userAddedFiltered.length

        setTotal(filteredTotal)
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
    deletedIds,
    customProducts,
  ])

  // პროდუქტის წაშლა
  function handleDeleteProduct(id: number) {
    setDeletedIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    )

    setCustomProducts((prev) =>
      prev.filter((product) => product.id !== id),
    )

    setProducts((prev) =>
      prev.filter((product) => product.id !== id),
    )

    setTotal((prev) => Math.max(0, prev - 1))
  }

  // ახალი პროდუქტის დამატება
  function handleAddProductSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const title = newTitle.trim()
    const price = Number(newPrice)

    if (
      !title ||
      !newCategory ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return
    }

    const image =
      newImage.trim() || 'https://via.placeholder.com/300'

    const createdProduct: Product = {
  id: Date.now(),
  title,
  price,
  category: newCategory,
  thumbnail: image,
  description: 'Custom added product',
  discountPercentage: 0,
  rating: 5,
  stock: 10,
  brand: 'Custom',
  images: [image],
}
    setCustomProducts((prev) => [
      createdProduct,
      ...prev,
    ])

    setSelectedCategory(newCategory)
    setSearch('')
    setPage(1)

    setNewTitle('')
    setNewPrice('')
    setNewCategory('')
    setNewImage('')
    setIsModalOpen(false)
  }

  // კატეგორიის შეცვლა
  function handleCategoryChange(value: string) {
    setSelectedCategory(value)
    setSearch('')
    setPage(1)
  }

  // კატეგორიებს შორის გადასვლა
  function goToCategory(index: number) {
    if (index < 0 || index >= categories.length) return

    setSelectedCategory(categories[index].slug)
    setSearch('')
    setPage(1)

    document.getElementById('products')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  // ძიება
  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  // დალაგება
  function handleSortChange(value: string) {
    setSortOrder(value)
    setPage(1)
  }

  // ფილტრების გასუფთავება
  function clearFilters() {
    setSearch('')
    setSortOrder('default')
    setPage(1)

    if (categories.length > 0) {
      setSelectedCategory(categories[0].slug)
    }
  }

  const displayedCategoryNumber =
    selectedCategoryIndex >= 0
      ? selectedCategoryIndex + 1
      : 0

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F3EEE6]">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-10 lg:px-8">

        {/* Hero section */}
        <section className="home-hero grid min-h-[260px] grid-cols-1 items-center gap-6 px-5 py-8 sm:min-h-[300px] sm:gap-8 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-16">
          <div className="relative z-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#956D27] sm:mb-4 sm:text-xs sm:tracking-[0.25em]">
              Premium quality · Everyday essentials
            </p>

            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discover the Best Products for You
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#62594D] sm:mt-5 sm:text-lg sm:leading-7">
              Explore quality products, discover new favorites and find
              everything you need in one place.
            </p>

            <a
              href="#products"
              className="mt-6 inline-flex items-center gap-3 rounded-lg bg-[#C9A04B] px-5 py-3 text-sm font-semibold text-[#17130A] shadow-sm transition hover:bg-[#E4C47A] sm:mt-8 sm:px-6 sm:py-3.5 sm:text-base"
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

        {/* Products section */}
        <section
          id="products"
          className="scroll-mt-6 py-9 sm:scroll-mt-8 sm:py-16"
        >
          {/* Section heading */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-7 sm:gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7025] sm:text-xs">
                The collection
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-[#24221F] sm:text-4xl">
                Our Products
              </h2>

            <p className="mt-2 text-xs text-[#777168] sm:text-sm">
  {search.trim() ? (
    `Search results for "${search.trim()}"`
  ) : activeCategory ? (
    `${activeCategory.name} collection`
  ) : (
    'Explore our collections.'
  )}
</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-[#C9A04B] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#E4C47A] sm:text-sm"
              >
                + Add Product
              </button>

              {!loading && !error && (
                <span className="shrink-0 rounded-full border border-[#E0D5C5] bg-white px-3 py-2 text-xs text-[#62594D] sm:px-4 sm:text-sm">
                  {total} products
                </span>
              )}
            </div>
          </div>

          {/* Search and filters */}
          <div className="filter-panel">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
              <div className="min-w-0">
                <label
                  htmlFor="product-search"
                  className="mb-2 block text-sm font-bold text-[#38332B] sm:text-base"
                >
                  Search products
                </label>

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder="Search by product name..."
                  className="w-full min-w-0 rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-bold text-[#38332B] sm:text-base"
                >
                  Category
                </label>

                <select
                  id="product-category"
                  value={selectedCategory}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  className="w-full min-w-0 rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
                >
                  {categories.map((category) => (
                    <option
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="product-sort"
                  className="mb-2 block text-sm font-bold text-[#38332B] sm:text-base"
                >
                  Sort by
                </label>

                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) =>
                    handleSortChange(event.target.value)
                  }
                  className="w-full min-w-0 rounded-lg border border-[#D9D0C3] bg-white px-4 py-3 text-sm text-[#24221F] outline-none transition focus:border-[#C9A04B] focus:ring-2 focus:ring-[#C9A04B]/20"
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

          {/* Categories */}
          {!search.trim() && categories.length > 0 && (
            <section className="mt-5 rounded-2xl border border-[#E3D8C6] bg-white/70 p-4 sm:mt-6 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7025] sm:text-xs sm:tracking-[0.18em]">
                    Shop by category
                  </p>

                  <h3 className="mt-1 text-base font-semibold text-[#24221F] sm:text-lg">
                    {activeCategory?.name ?? 'Choose a category'}
                  </h3>
                </div>

                <span className="text-xs text-[#777168] sm:text-sm">
                  Category {displayedCategoryNumber} of {categories.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => goToCategory(index)}
                    aria-pressed={
                      selectedCategory === category.slug
                    }
                    className={`max-w-full rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      selectedCategory === category.slug
                        ? 'border-[#C9A04B] bg-[#C9A04B] text-black'
                        : 'border-[#D9D0C3] bg-white text-[#38332B] hover:border-[#C9A04B]'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9E0D4] pt-4">
                <button
                  type="button"
                  disabled={selectedCategoryIndex <= 0}
                  onClick={() =>
                    goToCategory(selectedCategoryIndex - 1)
                  }
                  className="rounded-lg border border-[#D9D0C3] bg-white px-3 py-2 text-xs font-semibold text-[#38332B] hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  ← Previous
                </button>

                <span className="text-xs text-[#777168] sm:text-sm">
                  {displayedCategoryNumber} / {categories.length}
                </span>

                <button
                  type="button"
                  disabled={
                    selectedCategoryIndex < 0 ||
                    selectedCategoryIndex >= categories.length - 1
                  }
                  onClick={() =>
                    goToCategory(selectedCategoryIndex + 1)
                  }
                  className="rounded-lg border border-[#D9D0C3] bg-white px-3 py-2 text-xs font-semibold text-[#38332B] hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  Next →
                </button>
              </div>
            </section>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-6 rounded-2xl border border-[#E7DFD3] bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#E8DDC8] border-t-[#C9A04B]" />
              <p className="text-sm text-[#777168] sm:text-base">
                Loading products...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 text-center sm:p-6">
              <p className="text-sm text-red-600 sm:text-base">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRetryCount((count) => count + 1)
                }
                className="mt-4 rounded-lg bg-[#C9A04B] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#E4C47A]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Product count */}
          {!loading && !error && (
            <p className="mt-5 text-xs text-[#777168] sm:text-sm">
              Showing {products.length} products · Page {page} of{' '}
              {Math.max(totalPages, 1)}
            </p>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#E7DFD3] bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
              <p className="text-base font-semibold text-[#24221F] sm:text-lg">
                No products found
              </p>

              <p className="mt-2 text-xs text-[#777168] sm:text-sm">
                Try another search or change your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-[#C9A04B] px-5 py-3 text-sm font-semibold text-black hover:bg-[#E4C47A]"
              >
                Show category products
              </button>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:mt-6 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Product pages"
                  className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10"
                >
                  <button
                    type="button"
                    disabled={page === 1 || loading}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="rounded-lg border border-[#D9D0C3] bg-white px-3 py-2 text-xs font-semibold text-[#38332B] transition hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-current={
                        pageNumber === page ? 'page' : undefined
                      }
                      onClick={() => setPage(pageNumber)}
                      className={`h-9 min-w-9 rounded-lg border px-2 text-xs font-semibold transition sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm ${
                        pageNumber === page
                          ? 'border-[#C9A04B] bg-[#C9A04B] text-black'
                          : 'border-[#D9D0C3] bg-white text-[#38332B] hover:border-[#C9A04B]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="rounded-lg border border-[#D9D0C3] bg-white px-3 py-2 text-xs font-semibold text-[#38332B] transition hover:border-[#C9A04B] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {/* Add product modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#24221F]">
              Add New Product
            </h3>

            <form
              onSubmit={handleAddProductSubmit}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#38332B]">
                  Title
                </label>

                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Luxury Cream"
                  className="mt-1 w-full rounded-lg border border-[#D9D0C3] p-2 text-sm outline-none focus:border-[#C9A04B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38332B]">
                  Price ($)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="e.g. 19.99"
                  className="mt-1 w-full rounded-lg border border-[#D9D0C3] p-2 text-sm outline-none focus:border-[#C9A04B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38332B]">
                  Category
                </label>

                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-[#D9D0C3] p-2 text-sm outline-none focus:border-[#C9A04B]"
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#38332B]">
                  Image URL (Optional)
                </label>

                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-lg border border-[#D9D0C3] p-2 text-sm outline-none focus:border-[#C9A04B]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#C9A04B] px-4 py-2 text-xs font-semibold text-black hover:bg-[#E4C47A]"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home