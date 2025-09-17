// src/hooks/useStockMonitoring.ts
import { useEffect, useCallback } from 'react'
import { useProducts } from './useProducts'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from './useAuth'
import { STOCK_ALERTS } from '../utils/constants'

interface StockMonitoringOptions {
  enabled?: boolean
  checkInterval?: number // ms
  thresholds?: {
    critical: number
    low: number
    warning: number
  }
}

export const useStockMonitoring = (options: StockMonitoringOptions = {}) => {
  const { 
    enabled = true, 
    checkInterval = 60000, // 1 minuto por defecto
    thresholds = {
      critical: STOCK_ALERTS.CRITICAL_THRESHOLD,
      low: STOCK_ALERTS.LOW_THRESHOLD,
      warning: STOCK_ALERTS.WARNING_THRESHOLD
    }
  } = options

  const { products, loading } = useProducts()
  const { addStockAlert, removeStockAlert, notifications } = useNotifications()
  const { user } = useAuth()

  // Obtener productos con stock bajo
  const getLowStockProducts = useCallback(() => {
    if (!products) return []

    return products.filter(product => {
      if (product.stock === null || product.stock === undefined) return false
      return product.stock <= thresholds.warning
    })
  }, [products, thresholds])

  // Verificar y actualizar alertas de stock
  const checkStockLevels = useCallback(() => {
    if (!enabled || loading || !user) return

    const lowStockProducts = getLowStockProducts()
    const existingAlerts = notifications.filter(n => n.type === 'stock-alert')

    // Agregar nuevas alertas para productos con stock bajo
    lowStockProducts.forEach(product => {
      if (!product.stock || product.stock === null) return

      const hasExistingAlert = existingAlerts.some(alert => 
        alert.productId === product.id
      )

      if (!hasExistingAlert) {
        addStockAlert(
          product.nombre,
          product.codigo || `P-${product.id}`,
          product.stock,
          product.id
        )
      }
    })

    // Remover alertas para productos que ya no tienen stock bajo
    existingAlerts.forEach(alert => {
      if (!alert.productId) return

      const product = products?.find(p => p.id === alert.productId)
      
      // Si el producto no existe o ya no tiene stock bajo, remover alerta
      if (!product || !product.stock || product.stock > thresholds.warning) {
        removeStockAlert(alert.productId)
      }
    })
  }, [
    enabled, 
    loading, 
    user, 
    getLowStockProducts, 
    notifications, 
    products, 
    thresholds.warning, 
    addStockAlert, 
    removeStockAlert
  ])

  // Configurar monitoreo automático
  useEffect(() => {
    if (!enabled) return

    // Verificación inicial
    checkStockLevels()

    // Configurar interval para verificaciones periódicas
    const interval = setInterval(checkStockLevels, checkInterval)

    return () => clearInterval(interval)
  }, [enabled, checkStockLevels, checkInterval])

  // Verificar cuando cambian los productos
  useEffect(() => {
    if (enabled && !loading) {
      checkStockLevels()
    }
  }, [enabled, loading, checkStockLevels])

  // Método manual para forzar verificación
  const forceCheck = useCallback(() => {
    checkStockLevels()
  }, [checkStockLevels])

  // Estadísticas de stock
  const getStockStats = useCallback(() => {
    if (!products) return {
      total: 0,
      critical: 0,
      low: 0,
      warning: 0,
      healthy: 0
    }

    const stats = {
      total: products.length,
      critical: 0,
      low: 0,
      warning: 0,
      healthy: 0
    }

    products.forEach(product => {
      if (product.stock === null || product.stock === undefined) {
        return // No contar productos sin stock definido
      }

      if (product.stock <= thresholds.critical) {
        stats.critical++
      } else if (product.stock <= thresholds.low) {
        stats.low++
      } else if (product.stock <= thresholds.warning) {
        stats.warning++
      } else {
        stats.healthy++
      }
    })

    return stats
  }, [products, thresholds])

  return {
    checkStockLevels: forceCheck,
    getLowStockProducts,
    getStockStats,
    isMonitoring: enabled && !loading,
    lowStockCount: getLowStockProducts().length
  }
}