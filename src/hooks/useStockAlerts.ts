// src/hooks/useStockAlerts.ts
import { useMemo } from 'react'
import { STOCK_ALERTS, STOCK_ALERT_TYPES, type StockAlertType } from '../utils/constants'
import type { Producto } from '../lib/database.types'

export interface StockAlert {
  productId: number
  productName: string
  productCode: string
  currentStock: number
  alertType: StockAlertType
  message: string
  threshold: number
}

export interface StockAlertCounts {
  critical: number
  low: number
  warning: number
  normal: number
  total: number
}

/**
 * Hook para manejar alertas de stock bajo
 */
export const useStockAlerts = (products: Producto[] = []) => {
  
  /**
   * Determina el tipo de alerta basado en el stock actual
   */
  const getStockAlertType = (stock: number): StockAlertType => {
    if (stock <= STOCK_ALERTS.CRITICAL_THRESHOLD) {
      return STOCK_ALERT_TYPES.CRITICAL
    }
    if (stock <= STOCK_ALERTS.LOW_THRESHOLD) {
      return STOCK_ALERT_TYPES.LOW
    }
    if (stock <= STOCK_ALERTS.WARNING_THRESHOLD) {
      return STOCK_ALERT_TYPES.WARNING
    }
    return STOCK_ALERT_TYPES.NORMAL
  }

  /**
   * Obtiene el umbral correspondiente al tipo de alerta
   */
  const getThresholdForType = (alertType: StockAlertType): number => {
    switch (alertType) {
      case STOCK_ALERT_TYPES.CRITICAL:
        return STOCK_ALERTS.CRITICAL_THRESHOLD
      case STOCK_ALERT_TYPES.LOW:
        return STOCK_ALERTS.LOW_THRESHOLD
      case STOCK_ALERT_TYPES.WARNING:
        return STOCK_ALERTS.WARNING_THRESHOLD
      default:
        return 0
    }
  }

  /**
   * Obtiene el mensaje correspondiente al tipo de alerta
   */
  const getMessageForType = (alertType: StockAlertType): string => {
    switch (alertType) {
      case STOCK_ALERT_TYPES.CRITICAL:
        return 'Stock crítico - Reponer urgentemente'
      case STOCK_ALERT_TYPES.LOW:
        return 'Stock bajo - Considerar reposición'
      case STOCK_ALERT_TYPES.WARNING:
        return 'Stock en advertencia - Monitorear'
      default:
        return 'Stock normal'
    }
  }

  /**
   * Genera alertas para todos los productos
   */
  const stockAlerts = useMemo((): StockAlert[] => {
    return products.map(product => {
      const stock = product.stock || 0
      const alertType = getStockAlertType(stock)
      
      return {
        productId: product.id,
        productName: product.nombre,
        productCode: product.codigo,
        currentStock: stock,
        alertType,
        message: getMessageForType(alertType),
        threshold: getThresholdForType(alertType)
      }
    })
  }, [products])

  /**
   * Filtra solo los productos con alertas (excluyendo normal)
   */
  const alertsOnly = useMemo((): StockAlert[] => {
    return stockAlerts.filter(alert => alert.alertType !== STOCK_ALERT_TYPES.NORMAL)
  }, [stockAlerts])

  /**
   * Productos críticos (stock muy bajo)
   */
  const criticalAlerts = useMemo((): StockAlert[] => {
    return stockAlerts.filter(alert => alert.alertType === STOCK_ALERT_TYPES.CRITICAL)
  }, [stockAlerts])

  /**
   * Productos con stock bajo
   */
  const lowStockAlerts = useMemo((): StockAlert[] => {
    return stockAlerts.filter(alert => alert.alertType === STOCK_ALERT_TYPES.LOW)
  }, [stockAlerts])

  /**
   * Productos en advertencia
   */
  const warningAlerts = useMemo((): StockAlert[] => {
    return stockAlerts.filter(alert => alert.alertType === STOCK_ALERT_TYPES.WARNING)
  }, [stockAlerts])

  /**
   * Contadores de alertas por tipo
   */
  const alertCounts = useMemo((): StockAlertCounts => {
    const counts = stockAlerts.reduce((acc, alert) => {
      acc[alert.alertType]++
      acc.total++
      return acc
    }, {
      critical: 0,
      low: 0,
      warning: 0,
      normal: 0,
      total: 0
    })

    return counts
  }, [stockAlerts])

  /**
   * Verifica si un producto específico tiene alerta
   */
  const hasAlert = (productId: number): boolean => {
    const alert = stockAlerts.find(a => a.productId === productId)
    return alert ? alert.alertType !== STOCK_ALERT_TYPES.NORMAL : false
  }

  /**
   * Obtiene la alerta de un producto específico
   */
  const getProductAlert = (productId: number): StockAlert | undefined => {
    return stockAlerts.find(a => a.productId === productId)
  }

  /**
   * Verifica si hay alguna alerta crítica
   */
  const hasCriticalAlerts = useMemo((): boolean => {
    return criticalAlerts.length > 0
  }, [criticalAlerts])

  /**
   * Verifica si hay alertas de cualquier tipo
   */
  const hasAnyAlerts = useMemo((): boolean => {
    return alertsOnly.length > 0
  }, [alertsOnly])

  /**
   * Obtiene productos ordenados por criticidad de stock
   */
  const productsByStockCriticality = useMemo((): Producto[] => {
    return [...products].sort((a, b) => {
      const stockA = a.stock || 0
      const stockB = b.stock || 0
      
      // Primero productos con menos stock
      if (stockA !== stockB) {
        return stockA - stockB
      }
      
      // Si tienen el mismo stock, ordenar alfabéticamente
      return a.nombre.localeCompare(b.nombre)
    })
  }, [products])

  return {
    // Alertas
    stockAlerts,
    alertsOnly,
    criticalAlerts,
    lowStockAlerts,
    warningAlerts,
    
    // Contadores
    alertCounts,
    
    // Funciones de utilidad
    getStockAlertType,
    getMessageForType,
    getThresholdForType,
    hasAlert,
    getProductAlert,
    
    // Estados
    hasCriticalAlerts,
    hasAnyAlerts,
    
    // Datos ordenados
    productsByStockCriticality,
    
    // Constantes
    thresholds: STOCK_ALERTS
  }
}