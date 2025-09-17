// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'stock-alert'
  title: string
  message: string
  duration?: number // ms, 0 = persistent
  dismissible?: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  productId?: number // Para notificaciones de stock
  createdAt: Date
}

interface SnoozedAlert {
  productId: number
  snoozedUntil: Date
  lastStock: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  // Métodos específicos para stock alerts
  addStockAlert: (productName: string, productCode: string, currentStock: number, productId: number) => string
  removeStockAlert: (productId: number) => void
  dismissStockAlert: (productId: number, snoozeMinutes?: number) => void
  hasStockAlerts: boolean
  stockAlertsCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [snoozedAlerts, setSnoozedAlerts] = useState<SnoozedAlert[]>([])

  // Generar ID único para notificación
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Agregar notificación
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId()
    const notification: Notification = {
      id,
      createdAt: new Date(),
      duration: 5000, // 5 segundos por defecto
      dismissible: true,
      ...notificationData
    }

    setNotifications(prev => [notification, ...prev])

    // Auto-remover si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }

    return id
  }, [generateId])

  // Remover notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Método específico para alertas de stock
  const addStockAlert = useCallback((
    productName: string, 
    productCode: string, 
    currentStock: number, 
    productId: number
  ) => {
    // Verificar si ya existe una alerta para este producto
    const existingAlert = notifications.find(n => 
      n.type === 'stock-alert' && n.productId === productId
    )

    if (existingAlert) {
      return existingAlert.id // No crear duplicados
    }

    // Verificar si está en modo snooze
    const now = new Date()
    const snoozedAlert = snoozedAlerts.find(s => 
      s.productId === productId && s.snoozedUntil > now
    )

    // Si está en snooze y el stock no ha cambiado significativamente, no mostrar
    if (snoozedAlert && Math.abs(snoozedAlert.lastStock - currentStock) <= 1) {
      return '' // No crear notificación
    }

    const alertLevel = currentStock <= 5 ? 'crítico' : currentStock <= 10 ? 'bajo' : 'advertencia'
    const icon = currentStock <= 5 ? '🚨' : currentStock <= 10 ? '⚠️' : '⚡'

    return addNotification({
      type: 'stock-alert',
      title: `${icon} Stock ${alertLevel}`,
      message: `${productName} (${productCode}) tiene solo ${currentStock} unidades`,
      duration: 0, // Persistente hasta que se resuelva
      dismissible: true,
      productId,
      actions: [
        {
          label: 'Ver Producto',
          action: () => {
            window.location.href = `/products?search=${productCode}`
          },
          style: 'primary'
        },
        {
          label: 'Ir a Inventario',
          action: () => {
            window.location.href = '/inventory'
          },
          style: 'secondary'
        }
      ]
    })
  }, [notifications, addNotification, snoozedAlerts])

  // Remover alerta específica de stock
  const removeStockAlert = useCallback((productId: number) => {
    setNotifications(prev => prev.filter(n => 
      !(n.type === 'stock-alert' && n.productId === productId)
    ))
  }, [])

  // Descartar alerta con snooze opcional
  const dismissStockAlert = useCallback((productId: number, snoozeMinutes: number = 30) => {
    // Remover la notificación actual
    removeStockAlert(productId)
    
    // Agregar a la lista de snoozed alerts
    const snoozedUntil = new Date()
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + snoozeMinutes)
    
    // Buscar el stock actual del producto en las notificaciones
    const currentNotification = notifications.find(n => 
      n.type === 'stock-alert' && n.productId === productId
    )
    
    const lastStock = currentNotification ? 
      parseInt(currentNotification.message.match(/(\d+) unidades/)?.[1] || '0') : 0

    setSnoozedAlerts(prev => [
      ...prev.filter(s => s.productId !== productId), // Remover snooze anterior
      { productId, snoozedUntil, lastStock }
    ])
  }, [removeStockAlert, notifications])

  // Limpiar alertas snooze expiradas
  useEffect(() => {
    const cleanupSnooze = setInterval(() => {
      const now = new Date()
      setSnoozedAlerts(prev => prev.filter(s => s.snoozedUntil > now))
    }, 60000) // Revisar cada minuto

    return () => clearInterval(cleanupSnooze)
  }, [])

  // Computed properties para stock alerts
  const stockAlerts = notifications.filter(n => n.type === 'stock-alert')
  const hasStockAlerts = stockAlerts.length > 0
  const stockAlertsCount = stockAlerts.length

  // Limpiar notificaciones muy antiguas (opcional)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date()
      setNotifications(prev => prev.filter(notification => {
        // Mantener notificaciones persistentes (duration: 0)
        if (notification.duration === 0) return true
        
        // Remover notificaciones muy antiguas (> 1 hora)
        const age = now.getTime() - notification.createdAt.getTime()
        return age < 3600000 // 1 hora
      }))
    }, 60000) // Revisar cada minuto

    return () => clearInterval(cleanup)
  }, [])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    addStockAlert,
    removeStockAlert,
    dismissStockAlert,
    hasStockAlerts,
    stockAlertsCount
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}