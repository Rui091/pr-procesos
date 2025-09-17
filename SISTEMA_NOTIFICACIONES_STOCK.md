# Sistema de Notificaciones Globales de Stock - Documentación

## Resumen del Sistema

Se ha implementado un sistema completo de notificaciones globales que monitorea automáticamente los niveles de stock en toda la aplicación y muestra alertas en tiempo real cuando los productos están por debajo de ciertos umbrales.

## Características Principales

### 🔔 Notificaciones en Tiempo Real
- **Monitoreo automático**: Verificación cada 30 segundos de todos los productos
- **Alertas persistentes**: Las notificaciones de stock bajo permanecen hasta resolverse
- **Navegación rápida**: Botones de acción para ir directamente al producto o inventario
- **Badge en navbar**: Indicador visual con contador de alertas activas

### 📊 Niveles de Alerta de Stock
- **Crítico**: ≤ 5 unidades (🚨 rojo)
- **Bajo**: ≤ 10 unidades (⚠️ amarillo) 
- **Advertencia**: ≤ 15 unidades (⚡ naranja)

### 🎨 Interfaz de Usuario
- **Toast notifications**: Aparecem en la esquina superior derecha
- **Animaciones suaves**: Entrada/salida con transiciones CSS
- **Responsive**: Optimizado para escritorio y móvil
- **Accesible**: Soporte para lectores de pantalla

## Arquitectura Técnica

### Componentes Principales

#### 1. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
- **Propósito**: Proveedor global de estado para notificaciones
- **Funciones principales**:
  - `addNotification()`: Agregar notificación general
  - `addStockAlert()`: Crear alerta específica de stock
  - `removeNotification()`: Eliminar notificación por ID
  - `clearAll()`: Limpiar todas las notificaciones

#### 2. **useStockMonitoring** (`src/hooks/useStockMonitoring.ts`)
- **Propósito**: Hook para monitoreo automático de stock
- **Configuración**:
  ```typescript
  useStockMonitoring({
    enabled: true,
    checkInterval: 30000, // 30 segundos
    thresholds: {
      critical: 5,
      low: 10,
      warning: 15
    }
  })
  ```

#### 3. **NotificationContainer** (`src/components/notifications/NotificationContainer.tsx`)
- **Propósito**: Renderizar todas las notificaciones activas
- **Ubicación**: Esquina superior derecha (fixed position)
- **Z-index**: 50 (por encima de todo el contenido)

#### 4. **NotificationToast** (`src/components/notifications/NotificationToast.tsx`)
- **Propósito**: Componente individual de notificación
- **Características**:
  - Animación de entrada/salida
  - Botones de acción personalizables
  - Auto-dismiss configurable
  - Íconos por tipo de notificación

#### 5. **StockNotificationBadge** (`src/components/notifications/StockNotificationBadge.tsx`)
- **Propósito**: Indicador visual en la navbar
- **Funcionalidad**: 
  - Muestra contador de alertas activas
  - Click para navegar al inventario
  - Se oculta cuando no hay alertas

### Integración en la Aplicación

#### App.tsx
```typescript
<AuthProvider>
  <NotificationProvider>  // ← Proveedor global
    <SessionManager>
      <BrowserRouter>
        {/* Rutas */}
      </BrowserRouter>
    </SessionManager>
  </NotificationProvider>
</AuthProvider>
```

#### Layout.tsx
```typescript
const Layout = ({ children }) => {
  // Activar monitoreo global
  useStockMonitoring({
    enabled: true,
    checkInterval: 30000
  })

  return (
    <div>
      {children}
      <NotificationContainer />  // ← Contenedor de notificaciones
    </div>
  )
}
```

#### NavBar.tsx
```typescript
<StockNotificationBadge 
  onClick={() => window.location.href = '/inventory'}
/>
```

## Tipos de Notificaciones

### 1. **Stock Alerts** (Automáticas)
```typescript
{
  type: 'stock-alert',
  title: '🚨 Stock crítico',
  message: 'Producto XYZ (P001) tiene solo 3 unidades',
  duration: 0, // Persistente
  productId: 123,
  actions: [
    { label: 'Ver Producto', action: () => {} },
    { label: 'Ir a Inventario', action: () => {} }
  ]
}
```

### 2. **Notificaciones Generales**
```typescript
{
  type: 'success' | 'error' | 'warning' | 'info',
  title: 'Título',
  message: 'Mensaje detallado',
  duration: 5000, // ms (0 = persistente)
  dismissible: true,
  actions?: [...] // Opcional
}
```

## Panel de Control (Dashboard)

### StockNotificationSettings
- **Ubicación**: Dashboard principal
- **Funcionalidades**:
  - Estadísticas en tiempo real (crítico, bajo, advertencia, saludable)
  - Lista de alertas activas con timestamps
  - Botón para limpiar todas las notificaciones
  - Configuración visible del sistema

### NotificationDemo (Solo Admin)
- **Propósito**: Herramienta de prueba para administradores
- **Incluye**: Botones para probar todos los tipos de notificaciones

## Configuración y Personalización

### Umbrales de Stock
```typescript
// src/utils/constants.ts
export const STOCK_ALERTS = {
  CRITICAL_THRESHOLD: 5,
  LOW_THRESHOLD: 10,
  WARNING_THRESHOLD: 15,
  MIN_ALERT_THRESHOLD: 0
} as const
```

### Intervalos de Monitoreo
- **Verificación automática**: 30 segundos (configurable)
- **Limpieza de notificaciones**: 60 segundos
- **Auto-dismiss**: Variable por tipo de notificación

### Colores y Estilos
- **Crítico**: Rojo (`bg-red-500`, `border-red-200`)
- **Bajo**: Amarillo (`bg-yellow-500`, `border-yellow-200`)
- **Advertencia**: Naranja (`bg-orange-500`, `border-orange-200`)
- **Success**: Verde (`bg-green-500`)
- **Error**: Rojo (`bg-red-500`)
- **Info**: Azul (`bg-blue-500`)

## Flujo de Funcionamiento

1. **Inicialización**:
   - App.tsx envuelve la aplicación con NotificationProvider
   - Layout.tsx activa useStockMonitoring
   - NavBar.tsx muestra StockNotificationBadge

2. **Monitoreo Continuo**:
   - useStockMonitoring verifica productos cada 30 segundos
   - Compara stock actual vs umbrales configurados
   - Genera alertas para productos con stock bajo

3. **Gestión de Alertas**:
   - NotificationContext mantiene lista de notificaciones activas
   - Evita duplicados para el mismo producto
   - Remueve alertas cuando el stock se normaliza

4. **Renderizado**:
   - NotificationContainer muestra todas las notificaciones
   - StockNotificationBadge indica estado en navbar
   - Animaciones y transiciones para mejor UX

## Beneficios del Sistema

### Para el Negocio
- **Prevención de rupturas de stock**: Alertas tempranas
- **Mejora en gestión de inventario**: Visibilidad constante
- **Reducción de pérdidas**: Evitar ventas perdidas

### Para el Usuario
- **Información en tiempo real**: Sin necesidad de revisiones manuales
- **Navegación rápida**: Acceso directo a productos con problemas
- **Interfaz no intrusiva**: Notificaciones que no bloquean el trabajo

### Técnicos
- **Escalable**: Fácil agregar nuevos tipos de notificaciones
- **Performante**: Monitoreo eficiente con debouncing
- **Mantenible**: Código modular y bien tipado con TypeScript

## Archivos Relacionados

### Nuevos Archivos Creados
- `src/contexts/NotificationContext.tsx`
- `src/hooks/useStockMonitoring.ts`
- `src/components/notifications/NotificationContainer.tsx`
- `src/components/notifications/NotificationToast.tsx`
- `src/components/notifications/StockNotificationBadge.tsx`
- `src/components/notifications/StockNotificationSettings.tsx`
- `src/components/notifications/NotificationDemo.tsx`
- `src/components/notifications/index.ts`

### Archivos Modificados
- `src/App.tsx` - Agregado NotificationProvider
- `src/components/layout/Layout.tsx` - Integrado monitoreo y container
- `src/components/auth/NavBar.tsx` - Agregado badge de notificaciones
- `src/pages/Dashboard.tsx` - Agregado panel de control
- `src/contexts/index.ts` - Exportaciones actualizadas
- `src/hooks/index.ts` - Exportaciones actualizadas

## Próximas Mejoras Posibles

1. **Configuración por usuario**: Permitir umbrales personalizados
2. **Notificaciones push**: Integración con service workers
3. **Historial de alertas**: Log de notificaciones pasadas
4. **Filtros avanzados**: Por categoría de producto, proveedor, etc.
5. **Integración con email**: Envío de alertas críticas por correo