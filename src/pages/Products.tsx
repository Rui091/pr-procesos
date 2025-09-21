// src/pages/Products.tsx
import React, { useState, useMemo } from 'react'
import { ProductList, ProductForm, ProductSearch } from '../components/products'
import { useProducts } from '../hooks/useProducts'
import { useStockAlerts } from '../hooks/useStockAlerts'
import type { Producto } from '../lib/database.types'

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const { products, searchProducts } = useProducts()
  const { alertCounts } = useStockAlerts(products)

  // Productos filtrados por búsqueda
  const filteredProducts = useMemo(() => {
    return searchQuery ? searchProducts(searchQuery) : products
  }, [searchQuery, searchProducts, products])

  // Estadísticas de productos filtrados
  const stats = useMemo(() => {
    const totalProducts = filteredProducts.length
    const totalValue = filteredProducts.reduce((sum, product) => 
      sum + ((product.precio || 0) * (product.stock || 0)), 0
    )
    const outOfStock = filteredProducts.filter(p => (p.stock || 0) === 0).length
    const lowStock = filteredProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length

    return {
      totalProducts,
      totalValue,
      outOfStock,
      lowStock
    }
  }, [filteredProducts])

  const handleEditProduct = (product: Producto) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setSelectedProduct(null)
    setIsFormOpen(false)
  }

  const handleFormCancel = () => {
    setSelectedProduct(null)
    setIsFormOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona el catálogo completo de productos de tu negocio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de búsqueda avanzada */}
      <div className="mb-6">
        <ProductSearch
          onSearch={setSearchQuery}
          placeholder="Buscar productos por código o nombre..."
          className="max-w-2xl"
          debounceMs={300}
          showFilters={true}
        />
      </div>

      {/* Estadísticas de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Productos
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalProducts}
                    {searchQuery && (
                      <span className="text-sm text-gray-500 ml-1">
                        de {products.length}
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Valor Total Inventario
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Stock Bajo
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.lowStock}
                    {alertCounts.critical + alertCounts.low + alertCounts.warning > 0 && (
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {alertCounts.critical + alertCounts.low + alertCounts.warning} alertas
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sin Stock
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.outOfStock}
                    {stats.outOfStock > 0 && (
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Reponer
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <ProductList 
        onEditProduct={handleEditProduct}
        searchQuery={searchQuery}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductForm
                  product={selectedProduct}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
