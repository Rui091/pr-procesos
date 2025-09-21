// src/components/sales/SalesHistory.tsx
import React, { useState } from 'react'
import { useSalesHistory } from '../../hooks/useSalesHistory'
import { useCustomers } from '../../hooks/useCustomers'
import { formatCurrency, formatDate } from '../../utils/formatters'

export interface SalesHistoryProps {
  className?: string
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ className = '' }) => {
  const { customers } = useCustomers()
  const { 
    salesHistory, 
    loading, 
    error, 
    filters, 
    setFilters,
    refreshHistory,
    getCustomerStats 
  } = useSalesHistory()

  const [selectedView, setSelectedView] = useState<'list' | 'stats'>('list')

  const customerStats = getCustomerStats()

  // Manejar cambio de filtro de cliente
  const handleCustomerFilter = (customerId: string) => {
    setFilters({
      ...filters,
      clientId: customerId === '' ? null : parseInt(customerId)
    })
  }

  // Manejar cambio de fechas
  const handleDateFilter = (field: 'dateFrom' | 'dateTo', value: string) => {
    setFilters({
      ...filters,
      [field]: value || undefined
    })
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({})
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando historial...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={refreshHistory}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Encabezado con pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedView('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lista de Ventas
          </button>
          <button
            onClick={() => setSelectedView('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedView === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estadísticas por Cliente
          </button>
        </nav>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por cliente */}
          <div>
            <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              id="customer-filter"
              value={filters.clientId || ''}
              onChange={(e) => handleCustomerFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              id="date-from"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateFilter('dateFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              id="date-to"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateFilter('dateTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según la vista seleccionada */}
      {selectedView === 'list' ? (
        <SalesListView salesHistory={salesHistory} />
      ) : (
        <CustomerStatsView customerStats={customerStats} />
      )}
    </div>
  )
}

// Componente para la vista de lista de ventas
interface SalesListViewProps {
  salesHistory: any[]
}

const SalesListView: React.FC<SalesListViewProps> = ({ salesHistory }) => {
  if (salesHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📊</div>
        <p className="text-gray-500">No se encontraron ventas con los filtros aplicados</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesHistory.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.cliente?.nombre || 'Cliente General'}
                  </div>
                  {sale.cliente?.correo && (
                    <div className="text-sm text-gray-500">{sale.cliente.correo}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(sale.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.numero}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {sale.venta_item?.length > 0 ? (
                      <div className="space-y-1">
                        {sale.venta_item.slice(0, 2).map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.producto?.nombre || 'Producto eliminado'}</span>
                            <span className="text-gray-500">x{item.cantidad}</span>
                          </div>
                        ))}
                        {sale.venta_item.length > 2 && (
                          <div className="text-gray-500 text-xs">
                            +{sale.venta_item.length - 2} productos más
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Sin productos</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(sale.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para la vista de estadísticas por cliente
interface CustomerStatsViewProps {
  customerStats: Array<{
    customer: any
    totalSales: number
    totalAmount: number
    lastPurchase: string | null
  }>
}

const CustomerStatsView: React.FC<CustomerStatsViewProps> = ({ customerStats }) => {
  if (customerStats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📈</div>
        <p className="text-gray-500">No hay estadísticas disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customerStats.map((stat) => (
        <div key={stat.customer.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {stat.customer.nombre}
            </h3>
            <div className="text-sm text-gray-500">
              #{stat.customer.id}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total de Ventas:</span>
              <span className="text-sm font-medium text-gray-900">
                {stat.totalSales}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(stat.totalAmount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Última Compra:</span>
              <span className="text-sm text-gray-900">
                {stat.lastPurchase ? formatDate(stat.lastPurchase) : 'N/A'}
              </span>
            </div>
          </div>

          {stat.customer.correo && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 truncate">
                {stat.customer.correo}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SalesHistory