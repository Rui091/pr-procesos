// demo_stock_alerts.md
# Sistema de Alertas de Stock

El sistema de alertas de stock ha sido implementado con los siguientes umbrales configurables:

## 🔴 Umbrales de Alerta

- **CRÍTICO**: ≤ 5 unidades (Rojo)
- **BAJO**: ≤ 10 unidades (Amarillo)  
- **ADVERTENCIA**: ≤ 15 unidades (Naranja)
- **NORMAL**: > 15 unidades (Verde)

## 📦 Componentes Implementados

### 1. **useStockAlerts Hook**
```typescript
import { useStockAlerts } from '../hooks/useStockAlerts'

const { 
  criticalAlerts,     // Productos críticos
  lowStockAlerts,     // Productos con stock bajo
  alertCounts,        // Contadores por tipo
  hasAnyAlerts,       // Hay alguna alerta
  getStockAlertType   // Obtener tipo de alerta
} = useStockAlerts(products)
```

### 2. **ProductForm con Alertas Visuales**
- Muestra alertas en tiempo real mientras escribes el stock
- Colores diferenciados por nivel de criticidad
- Iconos y mensajes explicativos
- Validación visual inmediata

### 3. **ProductList con Indicadores**
- Filas coloreadas según el nivel de stock
- Badges con iconos de alerta
- Tooltips informativos
- Bordes laterales de colores para productos críticos

### 4. **StockAlert Component**
- Componente dedicado para dashboard
- Resumen de alertas por tipo
- Lista de productos con problemas
- Botones de acción directa

## 🎨 Colores del Sistema

- **Crítico**: Rojo (`bg-red-50`, `text-red-800`)
- **Bajo**: Amarillo (`bg-yellow-50`, `text-yellow-800`) 
- **Advertencia**: Naranja (`bg-orange-50`, `text-orange-800`)
- **Normal**: Verde (`bg-green-50`, `text-green-800`)

## 🔧 Uso en el Dashboard

```tsx
import StockAlert from '../components/StockAlert'

function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Contenido principal */}
      </div>
      <div>
        <StockAlert 
          maxItems={5}
          onProductClick={(id) => navigate(\`/products/edit/\${id}\`)}
        />
      </div>
    </div>
  )
}
```

## 📊 Ejemplo de Consulta SQL

```sql
-- Productos con alertas de stock
SELECT 
  p.id,
  p.codigo,
  p.nombre,
  p.stock,
  CASE 
    WHEN p.stock <= 5 THEN 'CRÍTICO'
    WHEN p.stock <= 10 THEN 'BAJO' 
    WHEN p.stock <= 15 THEN 'ADVERTENCIA'
    ELSE 'NORMAL'
  END as nivel_alerta
FROM producto p
WHERE p.stock <= 15
ORDER BY p.stock ASC, p.nombre ASC;
```

## 🚨 Funcionalidades Adicionales

1. **Notificaciones Push**: Se puede extender para enviar notificaciones
2. **Reportes**: Generar reportes de productos con stock bajo
3. **Reposición Automática**: Sugerir cantidades de reposición
4. **Historial**: Tracking de cuándo el stock llegó a niveles críticos
5. **Proveedores**: Integrar con sistema de proveedores para reposición

## 🔍 Testing

Para probar el sistema:

1. **Crear productos** con diferentes niveles de stock:
   - Stock 3: Debería aparecer como CRÍTICO
   - Stock 8: Debería aparecer como BAJO  
   - Stock 12: Debería aparecer como ADVERTENCIA
   - Stock 20: Debería aparecer como NORMAL

2. **Verificar colores** en ProductList y ProductForm
3. **Revisar dashboard** con el componente StockAlert
4. **Probar interacciones** de click en las alertas

## ⚙️ Configuración

Los umbrales se pueden modificar en `src/utils/constants.ts`:

```typescript
export const STOCK_ALERTS = {
  CRITICAL_THRESHOLD: 5,   // Cambiar según necesidades
  LOW_THRESHOLD: 10,       // del negocio
  WARNING_THRESHOLD: 15,
  MIN_ALERT_THRESHOLD: 0
}
```