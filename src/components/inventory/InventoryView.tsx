import { useState, useMemo } from 'react'
import { useInventory } from '../../hooks/useInventory'
import { useStockAlerts } from '../../hooks/useStockAlerts'
import { formatCurrency } from '../../utils/formatters'
import { STOCK_ALERT_COLORS } from '../../utils/constants'
import ProductSearch from '../products/ProductSearch'

export function InventoryView() {
  const { inventory, loading, error } = useInventory()
  const { getStockAlertType } = useStockAlerts(inventory)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'stock' | 'value'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and search products
  const filteredInventory = useMemo(() => {
    let filtered = inventory

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = inventory.filter(item => 
        item.nombre.toLowerCase().includes(query) ||
        item.codigo.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.nombre.toLowerCase()
          bValue = b.nombre.toLowerCase()
          break
        case 'code':
          aValue = a.codigo.toLowerCase()
          bValue = b.codigo.toLowerCase()
          break
        case 'stock':
          aValue = Math.abs(a.stock)
          bValue = Math.abs(b.stock)
          break
        case 'value':
          aValue = a.precio * Math.abs(a.stock)
          bValue = b.precio * Math.abs(b.stock)
          break
        default:
          aValue = a.nombre.toLowerCase()
          bValue = b.nombre.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [inventory, searchQuery, sortBy, sortOrder])

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalProducts = filteredInventory.length
    const totalValue = filteredInventory.reduce((sum, item) => sum + (item.precio * Math.abs(item.stock)), 0)
    const lowStockItems = filteredInventory.filter(item => getStockAlertType(Math.abs(item.stock)) !== 'normal').length
    const outOfStockItems = filteredInventory.filter(item => item.stock === 0).length

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems
    }
  }, [filteredInventory, getStockAlertType])

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Bar */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Buscar Productos</h3>
            <ProductSearch
              onSearch={setSearchQuery}
              placeholder="Buscar por nombre o código..."
              className="w-full"
              showFilters={false}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Productos</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Valor Total</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>

            {stats.lowStockItems > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.lowStockItems}</p>
                  </div>
                </div>
              </div>
            )}

            {stats.outOfStockItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Sin Stock</p>
                    <p className="text-2xl font-bold text-red-900">{stats.outOfStockItems}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mostrando {filteredInventory.length} de {inventory.length} productos para "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-6v6m3-3l-3-3m-3 3l3-3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos en el inventario'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? `No hay productos que coincidan con "${searchQuery}"`
                : 'Comienza agregando productos a tu inventario'
              }
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Código</span>
                    <SortIcon field="code" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Producto</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock</span>
                    <SortIcon field="stock" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Valor Total</span>
                    <SortIcon field="value" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockAlert = getStockAlertType(Math.abs(item.stock))
                const alertColors = STOCK_ALERT_COLORS[stockAlert]
                const isLowStock = stockAlert !== 'normal'

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isLowStock ? `${alertColors.bg} border-l-4 ${alertColors.border.replace('border-', 'border-l-')}` : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                      {isLowStock && (
                        <div className={`text-xs mt-1 ${alertColors.text} font-medium flex items-center`}>
                          <svg className={`w-3 h-3 mr-1 ${alertColors.icon}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {stockAlert === 'critical' ? 'Stock crítico' : stockAlert === 'low' ? 'Stock bajo' : 'Advertencia'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.precio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.stock < 0 ? 'bg-red-100 text-red-800' : 
                        item.stock === 0 ? 'bg-gray-100 text-gray-800' : 
                        isLowStock ? alertColors.badge :
                        'bg-green-100 text-green-800'
                      }`}>
                        {Math.abs(item.stock)} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {formatCurrency(item.precio * Math.abs(item.stock))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  Valor Total del Inventario{searchQuery && ' (filtrado)'}:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {formatCurrency(stats.totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
