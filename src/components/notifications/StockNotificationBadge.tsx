// src/components/notifications/StockNotificationBadge.tsx
import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'

interface StockNotificationBadgeProps {
  onClick?: () => void
  className?: string
}

export const StockNotificationBadge: React.FC<StockNotificationBadgeProps> = ({ 
  onClick, 
  className = '' 
}) => {
  const { stockAlertsCount, hasStockAlerts } = useNotifications()

  if (!hasStockAlerts) {
    return null
  }

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center p-2 text-sm font-medium text-center text-white bg-red-500 rounded-lg hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 transition-colors ${className}`}
      title={`${stockAlertsCount} producto${stockAlertsCount > 1 ? 's' : ''} con stock bajo`}
    >
      {/* Ícono de alerta */}
      <svg 
        className="w-5 h-5" 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fillRule="evenodd" 
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
          clipRule="evenodd"
        />
      </svg>
      
      {/* Badge con número */}
      <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-700 border-2 border-white rounded-full -top-2 -right-2">
        {stockAlertsCount > 99 ? '99+' : stockAlertsCount}
      </div>
      
      {/* Texto opcional */}
      <span className="sr-only">Stock bajo</span>
    </button>
  )
}