// src/pages/Sales.tsx
import React, { useState } from 'react'
import { SaleForm, SalesHistory } from '../components/sales'
import { useAuth } from '../contexts/AuthContext'
import { useSales } from '../hooks/useSales'
import { useCustomers } from '../hooks/useCustomers'
import { formatCurrency } from '../utils/formatters'

const SalesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'history'>('list')
  const { hasPermission, refreshSession } = useAuth()
  const { sales, loading, refreshSales, error } = useSales()
  const { customers } = useCustomers()
  
  console.log('🔍 Sales page - activeTab:', activeTab)
  console.log('🔍 Sales page - isFormOpen:', isFormOpen)
  
  const canCreateSales = hasPermission(['admin', 'manager', 'cashier'])
  
  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    await refreshSales()
  }

  // Función para refrescar sesión y datos
  const handleRefreshSession = async () => {
    console.log('🔄 Refrescando sesión y datos...')
    await refreshSession()
    await refreshSales()
  }

  // Función para obtener el nombre del cliente
  const getCustomerName = (clienteId: number | null) => {
    if (!clienteId) return 'Cliente general'
    const customer = customers.find(c => c.id === clienteId)
    return customer?.nombre || 'Cliente desconocido'
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Ventas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestión de ventas y transacciones
          </p>
          {/* DEBUG INFO */}
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p><strong>DEBUG:</strong> isFormOpen: {isFormOpen ? 'SÍ' : 'NO'} | activeTab: {activeTab}</p>
          </div>
        </div>
        {canCreateSales && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg 
                className="-ml-1 mr-2 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Nueva Venta
            </button>
          </div>
        )}
      </div>

      {isFormOpen ? (
        <SaleForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-lg">
          {/* DEBUG: Verificar que este div se renderiza */}
          <div className="p-2 bg-green-100 text-green-800 text-xs">
            ✅ PESTAÑAS CARGADAS - activeTab actual: {activeTab}
          </div>
          
          {/* Pestañas de navegación */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => {
                  console.log('🔧 Cambiando a pestaña list')
                  setActiveTab('list')
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Lista de Ventas
              </button>
              <button
                onClick={() => {
                  console.log('🔧 Cambiando a pestaña history')
                  setActiveTab('history')
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Historial por Cliente
              </button>
            </nav>
          </div>

          {/* Contenido según la pestaña activa */}
          {activeTab === 'list' ? (
            <SalesListTab
              sales={sales}
              loading={loading}
              error={error}
              customers={customers}
              getCustomerName={getCustomerName}
              handleRefreshSession={handleRefreshSession}
              refreshSales={refreshSales}
              canCreateSales={canCreateSales}
              setIsFormOpen={setIsFormOpen}
            />
          ) : (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">🚀 Nueva funcionalidad - Historial por Cliente</h2>
              <p className="text-gray-600 mb-4">Esta es la nueva vista de historial de ventas por cliente.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  <strong>Funcionalidades incluidas:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 text-yellow-700">
                  <li>Filtros por cliente y fecha</li>
                  <li>Vista de lista detallada</li>
                  <li>Estadísticas por cliente</li>
                  <li>Información de productos por venta</li>
                </ul>
              </div>
              {/* <SalesHistory /> */}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para la pestaña de lista de ventas
interface SalesListTabProps {
  sales: any[]
  loading: boolean
  error: string | null
  customers: any[]
  getCustomerName: (clienteId: number | null) => string
  handleRefreshSession: () => Promise<void>
  refreshSales: () => Promise<void>
  canCreateSales: boolean
  setIsFormOpen: (isOpen: boolean) => void
}

const SalesListTab: React.FC<SalesListTabProps> = ({
  sales,
  loading,
  error,
  getCustomerName,
  handleRefreshSession,
  refreshSales,
  canCreateSales,
  setIsFormOpen
}) => {
  return (
    <div className="px-4 py-6">
      {/* Mostrar error si hay problemas de permisos */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="flex-shrink-0 w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error de permisos</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-2">
                <button
                  onClick={handleRefreshSession}
                  className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded-md"
                >
                  🔄 Refrescar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando ventas...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-8">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas registradas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando una nueva venta.
          </p>
          {canCreateSales && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg 
                  className="-ml-1 mr-2 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Nueva Venta
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Historial de Ventas ({sales.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleRefreshSession}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Refrescar Sesión
              </button>
              <button
                onClick={refreshSales}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCustomerName(sale.cliente_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {sale.total ? formatCurrency(sale.total) : 'Sin total'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesPage
