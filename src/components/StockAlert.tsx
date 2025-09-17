// src/components/StockAlert.tsx
import React from 'react'
import { useStockAlerts } from '../hooks/useStockAlerts'
import { useProducts } from '../hooks/useProducts'
import { STOCK_ALERT_COLORS } from '../utils/constants'

interface StockAlertProps {
  className?: string
  showSummary?: boolean
  maxItems?: number
  onProductClick?: (productId: number) => void
}

const StockAlert: React.FC<StockAlertProps> = ({
  className = '',
  showSummary = true,
  maxItems = 5,
  onProductClick
}) => {
  const { products, loading } = useProducts()
  const {
    alertsOnly,
    criticalAlerts,
    lowStockAlerts,
    warningAlerts,
    alertCounts,
    hasCriticalAlerts,
    hasAnyAlerts
  } = useStockAlerts(products)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!hasAnyAlerts) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Stock en buen estado
            </h3>
            <p className="text-xs text-green-700 mt-1">
              Todos los productos tienen stock adecuado
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${hasCriticalAlerts ? 'border-red-200' : 'border-yellow-200'} ${className}`}>
      {/* Header con resumen */}
      {showSummary && (
        <div className={`px-4 py-3 ${hasCriticalAlerts ? 'bg-red-50' : 'bg-yellow-50'} rounded-t-lg border-b ${hasCriticalAlerts ? 'border-red-200' : 'border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {hasCriticalAlerts ? (
                <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <h3 className={`text-sm font-medium ${hasCriticalAlerts ? 'text-red-800' : 'text-yellow-800'}`}>
                Alertas de Stock
              </h3>
            </div>
            <div className="flex space-x-2">
              {alertCounts.critical > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {alertCounts.critical} crítico{alertCounts.critical !== 1 ? 's' : ''}
                </span>
              )}
              {alertCounts.low > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {alertCounts.low} bajo{alertCounts.low !== 1 ? 's' : ''}
                </span>
              )}
              {alertCounts.warning > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {alertCounts.warning} advertencia{alertCounts.warning !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos con alertas */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Productos críticos primero */}
          {criticalAlerts.slice(0, maxItems).map((alert) => (
            <div
              key={alert.productId}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${STOCK_ALERT_COLORS.critical.bg} ${STOCK_ALERT_COLORS.critical.border}`}
              onClick={() => onProductClick?.(alert.productId)}
            >
              <div className="flex items-center">
                <svg className={`h-4 w-4 mr-3 ${STOCK_ALERT_COLORS.critical.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className={`text-sm font-medium ${STOCK_ALERT_COLORS.critical.text}`}>
                    {alert.productName}
                  </p>
                  <p className={`text-xs ${STOCK_ALERT_COLORS.critical.text} opacity-75`}>
                    Código: {alert.productCode} • {alert.currentStock} unidades
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STOCK_ALERT_COLORS.critical.badge}`}>
                CRÍTICO
              </span>
            </div>
          ))}

          {/* Productos con stock bajo */}
          {lowStockAlerts.slice(0, Math.max(0, maxItems - criticalAlerts.length)).map((alert) => (
            <div
              key={alert.productId}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${STOCK_ALERT_COLORS.low.bg} ${STOCK_ALERT_COLORS.low.border}`}
              onClick={() => onProductClick?.(alert.productId)}
            >
              <div className="flex items-center">
                <svg className={`h-4 w-4 mr-3 ${STOCK_ALERT_COLORS.low.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className={`text-sm font-medium ${STOCK_ALERT_COLORS.low.text}`}>
                    {alert.productName}
                  </p>
                  <p className={`text-xs ${STOCK_ALERT_COLORS.low.text} opacity-75`}>
                    Código: {alert.productCode} • {alert.currentStock} unidades
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STOCK_ALERT_COLORS.low.badge}`}>
                BAJO
              </span>
            </div>
          ))}

          {/* Productos en advertencia */}
          {warningAlerts.slice(0, Math.max(0, maxItems - criticalAlerts.length - lowStockAlerts.length)).map((alert) => (
            <div
              key={alert.productId}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${STOCK_ALERT_COLORS.warning.bg} ${STOCK_ALERT_COLORS.warning.border}`}
              onClick={() => onProductClick?.(alert.productId)}
            >
              <div className="flex items-center">
                <svg className={`h-4 w-4 mr-3 ${STOCK_ALERT_COLORS.warning.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className={`text-sm font-medium ${STOCK_ALERT_COLORS.warning.text}`}>
                    {alert.productName}
                  </p>
                  <p className={`text-xs ${STOCK_ALERT_COLORS.warning.text} opacity-75`}>
                    Código: {alert.productCode} • {alert.currentStock} unidades
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STOCK_ALERT_COLORS.warning.badge}`}>
                ADVERTENCIA
              </span>
            </div>
          ))}
        </div>

        {/* Mostrar más productos si hay */}
        {alertsOnly.length > maxItems && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Y {alertsOnly.length - maxItems} producto{alertsOnly.length - maxItems !== 1 ? 's' : ''} más con alertas de stock
            </p>
          </div>
        )}

        {/* Botón de acción */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/products'}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      </div>
    </div>
  )
}

export default StockAlert