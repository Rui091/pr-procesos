import React from 'react'
import { NotificationContainer } from '../notifications'
import { useStockMonitoring } from '../../hooks'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Activar el monitoreo de stock global
  useStockMonitoring({
    enabled: true,
    checkInterval: 30000, // 30 segundos
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        {children}
      </div>
      
      {/* Contenedor global de notificaciones */}
      <NotificationContainer />
    </div>
  )
}

export default Layout
