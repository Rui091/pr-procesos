// src/hooks/useSalesHistory.ts
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCustomers } from './useCustomers'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Venta = Database['public']['Tables']['venta']['Row']
type VentaItem = Database['public']['Tables']['venta_item']['Row']
type Cliente = Database['public']['Tables']['cliente']['Row']
type Producto = Database['public']['Tables']['producto']['Row']

// Tipo extendido para ventas con detalles
export interface VentaWithDetails extends Venta {
  venta_item: (VentaItem & {
    producto: Producto
  })[]
  cliente?: Cliente
}

export interface SalesHistoryFilters {
  clientId?: number | null
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

interface UseSalesHistoryReturn {
  salesHistory: VentaWithDetails[]
  loading: boolean
  error: string | null
  filters: SalesHistoryFilters
  setFilters: (filters: SalesHistoryFilters) => void
  refreshHistory: () => Promise<void>
  // Funciones de utilidad
  getTotalByCustomer: (customerId: number) => number
  getSalesByCustomer: (customerId: number) => VentaWithDetails[]
  getCustomerStats: () => Array<{
    customer: Cliente
    totalSales: number
    totalAmount: number
    lastPurchase: string | null
  }>
}

export const useSalesHistory = (): UseSalesHistoryReturn => {
  const { org } = useAuth()
  const { customers } = useCustomers()
  const [salesHistory, setSalesHistory] = useState<VentaWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SalesHistoryFilters>({})

  // Cargar historial de ventas con detalles
  const loadSalesHistory = async () => {
    if (!org?.id) {
      console.log('⚠️ No hay org_id, no se puede cargar historial')
      setSalesHistory([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔧 Cargando historial de ventas para org_id:', org.id)

      // Construir query con filtros
      let query = supabase
        .from('venta')
        .select(`
          *,
          venta_item (
            *,
            producto (
              id,
              nombre,
              codigo,
              precio
            )
          )
        `)
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.clientId) {
        query = query.eq('cliente_id', filters.clientId)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('❌ Error cargando historial:', fetchError)
        setError(`Error al cargar historial: ${fetchError.message}`)
        setSalesHistory([])
        return
      }

      // Procesar datos y agregar información del cliente
      const processedData = (data || []).map((venta: any) => {
        const cliente = venta.cliente_id 
          ? customers.find(c => c.id === venta.cliente_id)
          : undefined

        return {
          ...venta,
          cliente,
          venta_item: venta.venta_item || []
        } as VentaWithDetails
      })

      setSalesHistory(processedData)
      console.log('✅ Historial cargado:', processedData.length, 'ventas')

    } catch (err) {
      console.error('❌ Error inesperado:', err)
      setError('Error inesperado al cargar el historial')
      setSalesHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Refrescar historial
  const refreshHistory = async () => {
    await loadSalesHistory()
  }

  // Cargar al montar y cuando cambien filtros o organización
  useEffect(() => {
    loadSalesHistory()
  }, [org?.id, filters, customers])

  // Funciones de utilidad con memoización
  const getTotalByCustomer = useMemo(() => 
    (customerId: number): number => {
      return salesHistory
        .filter(sale => sale.cliente_id === customerId)
        .reduce((total, sale) => total + (sale.total || 0), 0)
    }, [salesHistory]
  )

  const getSalesByCustomer = useMemo(() => 
    (customerId: number): VentaWithDetails[] => {
      return salesHistory.filter(sale => sale.cliente_id === customerId)
    }, [salesHistory]
  )

  const getCustomerStats = useMemo(() => 
    (): Array<{
      customer: Cliente
      totalSales: number
      totalAmount: number
      lastPurchase: string | null
    }> => {
      const stats = new Map()

      customers.forEach(customer => {
        const customerSales = salesHistory.filter(sale => sale.cliente_id === customer.id)
        const totalSales = customerSales.length
        const totalAmount = customerSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        const lastPurchase = customerSales.length > 0 
          ? customerSales[0].created_at // Ya está ordenado por fecha desc
          : null

        if (totalSales > 0) {
          stats.set(customer.id, {
            customer,
            totalSales,
            totalAmount,
            lastPurchase
          })
        }
      })

      return Array.from(stats.values()).sort((a, b) => b.totalAmount - a.totalAmount)
    }, [salesHistory, customers]
  )

  return {
    salesHistory,
    loading,
    error,
    filters,
    setFilters,
    refreshHistory,
    getTotalByCustomer,
    getSalesByCustomer,
    getCustomerStats
  }
}