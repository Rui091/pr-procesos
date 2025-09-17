// Constants for the POS system

// Stock Alert Thresholds
export const STOCK_ALERTS = {
  // Stock level below this is considered critical (red alert)
  CRITICAL_THRESHOLD: 5,
  
  // Stock level below this is considered low (yellow alert)
  LOW_THRESHOLD: 10,
  
  // Stock level below this is considered warning (orange alert)
  WARNING_THRESHOLD: 15,
  
  // Minimum stock to display any alert
  MIN_ALERT_THRESHOLD: 0
} as const

// Stock Alert Types
export const STOCK_ALERT_TYPES = {
  CRITICAL: 'critical',
  LOW: 'low', 
  WARNING: 'warning',
  NORMAL: 'normal'
} as const

export type StockAlertType = typeof STOCK_ALERT_TYPES[keyof typeof STOCK_ALERT_TYPES]

// Stock Alert Colors
export const STOCK_ALERT_COLORS = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    icon: 'text-red-500'
  },
  low: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200', 
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: 'text-yellow-500'
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800', 
    badge: 'bg-orange-100 text-orange-800',
    icon: 'text-orange-500'
  },
  normal: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800', 
    icon: 'text-green-500'
  }
} as const

// Stock Alert Messages
export const STOCK_ALERT_MESSAGES = {
  critical: 'Stock crítico - Reponer urgentemente',
  low: 'Stock bajo - Considerar reposición',
  warning: 'Stock en advertencia - Monitorear',
  normal: 'Stock normal'
} as const

// Other constants
export const CURRENCY = 'COP'
export const DECIMAL_PLACES = 2