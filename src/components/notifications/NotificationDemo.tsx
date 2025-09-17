// src/components/notifications/NotificationDemo.tsx
import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'

export const NotificationDemo: React.FC = () => {
  const { addNotification, addStockAlert } = useNotifications()

  const showSuccessNotification = () => {
    addNotification({
      type: 'success',
      title: '¡Éxito!',
      message: 'La operación se completó correctamente',
      duration: 3000
    })
  }

  const showErrorNotification = () => {
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Ocurrió un problema al procesar la solicitud',
      duration: 5000
    })
  }

  const showWarningNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Advertencia',
      message: 'Esta acción requiere confirmación',
      duration: 4000,
      actions: [
        {
          label: 'Confirmar',
          action: () => console.log('Confirmado'),
          style: 'primary'
        },
        {
          label: 'Cancelar',
          action: () => console.log('Cancelado'),
          style: 'secondary'
        }
      ]
    })
  }

  const showInfoNotification = () => {
    addNotification({
      type: 'info',
      title: 'Información',
      message: 'Hay una nueva actualización disponible',
      duration: 6000
    })
  }

  const showStockAlertNotification = () => {
    addStockAlert(
      'Producto de Prueba',
      'TEST001',
      3,
      999
    )
  }

  const showPersistentNotification = () => {
    addNotification({
      type: 'info',
      title: 'Notificación Persistente',
      message: 'Esta notificación permanecerá hasta que la cierres manualmente',
      duration: 0, // Persistente
      dismissible: true
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Demo de Notificaciones
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={showSuccessNotification}
          className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
        >
          Éxito
        </button>
        
        <button
          onClick={showErrorNotification}
          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
        >
          Error
        </button>
        
        <button
          onClick={showWarningNotification}
          className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
        >
          Advertencia
        </button>
        
        <button
          onClick={showInfoNotification}
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Información
        </button>
        
        <button
          onClick={showStockAlertNotification}
          className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
        >
          Stock Bajo
        </button>
        
        <button
          onClick={showPersistentNotification}
          className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
        >
          Persistente
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mt-3">
        Haz clic en los botones para probar diferentes tipos de notificaciones.
      </p>
    </div>
  )
}