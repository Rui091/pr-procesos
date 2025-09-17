// src/components/customers/CustomerList.tsx
import React, { useState } from 'react'
import { useCustomers } from '../../hooks/useCustomers'
import { useAuth } from '../../contexts/AuthContext'
import type { Cliente } from '../../lib/database.types'
import { formatDate } from '../../utils/formatters'

interface CustomerListProps {
  onEditCustomer?: (customer: Cliente) => void
  onSelectCustomer?: (customer: Cliente) => void
  searchQuery?: string
  selectable?: boolean
}

const CustomerList: React.FC<CustomerListProps> = ({
  onEditCustomer,
  onSelectCustomer,
  searchQuery = '',
  selectable = false
}) => {
  const { hasPermission } = useAuth()
  const { customers, loading, error, deleteCustomer, searchCustomers } = useCustomers()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Clientes filtrados por búsqueda
  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers

  const handleDelete = async (customer: Cliente) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente "${customer.nombre}"?`)) {
      return
    }

    setDeletingId(customer.id)
    try {
      const { success, error } = await deleteCustomer(customer.id)
      if (!success && error) {
        alert(error)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const formatIdDisplay = (customer: Cliente): string => {
    if (!customer.tipo_id || !customer.idnum) {
      return 'No especificado'
    }
    return `${customer.tipo_id}: ${customer.idnum}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando clientes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
    )
  }

  if (filteredCustomers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">
          {searchQuery ? 'No se encontraron clientes' : 'No hay clientes'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {searchQuery 
            ? `No hay clientes que coincidan con "${searchQuery}"` 
            : 'Comienza registrando tu primer cliente.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer: Cliente) => (
              <tr 
                key={customer.id} 
                className={`hover:bg-gray-50 ${selectable ? 'cursor-pointer' : ''}`}
                onClick={() => selectable && onSelectCustomer?.(customer)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.nombre}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatIdDisplay(customer)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.correo || 'No especificado'}
                  </div>
                  {customer.correo && (
                    <div className="text-sm text-gray-500">
                      <a 
                        href={`mailto:${customer.correo}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Enviar email
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {selectable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCustomer?.(customer)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Seleccionar
                      </button>
                    )}
                    
                    {hasPermission(['admin', 'manager']) && onEditCustomer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditCustomer(customer)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                    )}
                    
                    {hasPermission(['admin']) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(customer)
                        }}
                        disabled={deletingId === customer.id}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === customer.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomerList