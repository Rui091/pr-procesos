// src/components/notifications/StockNotificationSettings.tsx
import React, { useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import { useStockMonitoring } from '../../hooks'

export const StockNotificationSettings: React.FC = () => {
  const { clearAll, stockAlertsCount, notifications } = useNotifications()
  const { getStockStats } = useStockMonitoring()
  const [showDetails, setShowDetails] = useState(false)

  const stats = getStockStats()
  const stockAlerts = notifications.filter(n => n.type === 'stock-alert')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notificaciones de Stock
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Ocultar' : 'Ver'} detalles
          </button>
          {stockAlertsCount > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpiar todas
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-red-800">Crítico</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.low}</div>
          <div className="text-sm text-yellow-800">Bajo</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.warning}</div>
          <div className="text-sm text-orange-800">Advertencia</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          <div className="text-sm text-green-800">Saludable</div>
        </div>
      </div>

      {/* Estado actual */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${stockAlertsCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-sm font-medium">
            {stockAlertsCount > 0 
              ? `${stockAlertsCount} notificación${stockAlertsCount > 1 ? 'es' : ''} activa${stockAlertsCount > 1 ? 's' : ''}`
              : 'Sin alertas de stock'
            }
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Monitoreo activo
        </span>
      </div>

      {/* Detalles expandibles */}
      {showDetails && stockAlerts.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Alertas activas:</h4>
          {stockAlerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-red-800">
                  {alert.title}
                </div>
                <div className="text-xs text-red-600">
                  {alert.message}
                </div>
              </div>
              <div className="text-xs text-red-500">
                {new Date(alert.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuración */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Configuración:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Las notificaciones se verifican cada 30 segundos</div>
          <div>• Stock crítico: ≤ 5 unidades</div>
          <div>• Stock bajo: ≤ 10 unidades</div>
          <div>• Stock advertencia: ≤ 15 unidades</div>
          <div>• <span className="font-medium">Snooze inteligente:</span> Al cerrar una alerta, no reaparecerá por el tiempo seleccionado</div>
          <div>• Las alertas se reactivan si el stock cambia significativamente</div>
        </div>
      </div>
    </div>
  )
}