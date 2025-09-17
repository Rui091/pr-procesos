// src/components/notifications/NotificationToast.tsx
import React, { useEffect, useState } from 'react'
import { useNotifications, type Notification } from '../../contexts/NotificationContext'

interface NotificationToastProps {
  notification: Notification
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const { removeNotification, dismissStockAlert } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Manejar cierre
  const handleClose = () => {
    if (!notification.dismissible) return
    
    setIsExiting(true)
    setTimeout(() => {
      // Si es una alerta de stock, usar dismissStockAlert para evitar que reaparezca
      if (notification.type === 'stock-alert' && notification.productId) {
        dismissStockAlert(notification.productId, 30) // Snooze por 30 minutos
      } else {
        removeNotification(notification.id)
      }
    }, 300) // Duración de la animación
  }

  // Estilos según el tipo de notificación
  const getNotificationStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-white"
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-l-4 border-l-green-500`
      case 'error':
        return `${baseStyles} border-l-4 border-l-red-500`
      case 'warning':
        return `${baseStyles} border-l-4 border-l-yellow-500`
      case 'info':
        return `${baseStyles} border-l-4 border-l-blue-500`
      case 'stock-alert':
        return `${baseStyles} border-l-4 border-l-orange-500 bg-orange-50`
      default:
        return baseStyles
    }
  }

  // Ícono según el tipo
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'stock-alert':
        return '📦'
      default:
        return '🔔'
    }
  }

  // Clases de animación
  const animationClasses = `
    transform transition-all duration-300 ease-in-out
    ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
  `

  return (
    <div className={`${getNotificationStyles()} ${animationClasses} p-4 max-w-sm w-full`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getIcon()}</span>
          <h4 className="font-semibold text-gray-900 text-sm">
            {notification.title}
          </h4>
        </div>
        
        {notification.dismissible && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
            aria-label="Cerrar notificación"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Mensaje */}
      <p className="text-gray-700 text-sm mt-1 pr-6">
        {notification.message}
      </p>

      {/* Acciones */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="flex space-x-2 mt-3">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action()
                if (notification.dismissible) {
                  handleClose()
                }
              }}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                action.style === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : action.style === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Opciones de snooze para alertas de stock */}
      {notification.type === 'stock-alert' && notification.productId && (
        <div className="flex space-x-1 mt-2">
          <span className="text-xs text-gray-500 mr-2">Recordar en:</span>
          {[
            { label: '15min', minutes: 15 },
            { label: '30min', minutes: 30 },
            { label: '1h', minutes: 60 },
            { label: '4h', minutes: 240 }
          ].map((option) => (
            <button
              key={option.minutes}
              onClick={() => {
                if (notification.productId) {
                  dismissStockAlert(notification.productId, option.minutes)
                }
              }}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra de progreso para notificaciones temporales */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
          <div 
            className="h-full bg-blue-500 animate-pulse"
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      {/* Estilos CSS inline para la animación de progreso */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}