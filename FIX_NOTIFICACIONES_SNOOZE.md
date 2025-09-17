# Fix: Sistema de Snooze para Notificaciones de Stock

## Problema Resuelto
**Problema original**: Las notificaciones de stock volvían a aparecer inmediatamente después de cerrarlas porque el sistema de monitoreo automático las recreaba.

## Solución Implementada

### 🔧 **Sistema de Snooze Inteligente**

#### Funcionalidad Principal
- **Snooze automático**: Al cerrar una alerta de stock, se oculta por 30 minutos por defecto
- **Opciones flexibles**: El usuario puede elegir el tiempo de snooze (15min, 30min, 1h, 4h)
- **Reactivación inteligente**: Las alertas se reactivan si el stock cambia significativamente (±1 unidad)
- **Limpieza automática**: Los snoozes expirados se eliminan automáticamente

#### Cambios en la Interfaz
```tsx
// Nuevas opciones de snooze en cada notificación
{notification.type === 'stock-alert' && (
  <div className="flex space-x-1 mt-2">
    <span className="text-xs text-gray-500">Recordar en:</span>
    {[15min, 30min, 1h, 4h].map(option => (
      <button onClick={() => dismissStockAlert(productId, minutes)}>
        {option.label}
      </button>
    ))}
  </div>
)}
```

### 📝 **Cambios Técnicos**

#### 1. **NotificationContext.tsx**
- **Nueva interfaz**: `SnoozedAlert` para trackear alertas en pausa
- **Nuevo estado**: `snoozedAlerts` para gestionar productos en snooze
- **Nueva función**: `dismissStockAlert()` para pausar alertas específicas
- **Lógica mejorada**: `addStockAlert()` ahora respeta el estado de snooze

```typescript
interface SnoozedAlert {
  productId: number
  snoozedUntil: Date
  lastStock: number
}

const dismissStockAlert = (productId: number, snoozeMinutes: number = 30) => {
  removeStockAlert(productId)
  
  const snoozedUntil = new Date()
  snoozedUntil.setMinutes(snoozedUntil.getMinutes() + snoozeMinutes)
  
  setSnoozedAlerts(prev => [
    ...prev.filter(s => s.productId !== productId),
    { productId, snoozedUntil, lastStock }
  ])
}
```

#### 2. **NotificationToast.tsx**
- **Cierre inteligente**: Las alertas de stock usan `dismissStockAlert()` en lugar de `removeNotification()`
- **Interfaz mejorada**: Botones de snooze con tiempos predefinidos
- **UX mejorada**: Opciones claras y visibles para el usuario

#### 3. **Validación de Snooze**
```typescript
// En addStockAlert() - verificar si está en snooze
const snoozedAlert = snoozedAlerts.find(s => 
  s.productId === productId && s.snoozedUntil > now
)

// No mostrar si está en snooze y el stock no cambió significativamente
if (snoozedAlert && Math.abs(snoozedAlert.lastStock - currentStock) <= 1) {
  return '' // No crear notificación
}
```

### 🎯 **Beneficios del Sistema**

#### Para el Usuario
- **Control total**: Decide cuándo ver las alertas nuevamente
- **No más interrupciones**: Las alertas no reaparecen constantemente
- **Flexibilidad**: Diferentes opciones de tiempo según la urgencia
- **Experiencia fluida**: El trabajo no se interrumpe por alertas repetitivas

#### Para el Sistema
- **Inteligente**: Solo reactiva alertas cuando es relevante (stock cambió)
- **Eficiente**: Reduce notificaciones innecesarias
- **Escalable**: Sistema fácil de extender con más opciones
- **Mantenible**: Limpieza automática de snoozes expirados

### 📊 **Comportamiento del Sistema**

#### Flujo Normal
1. **Detección**: Sistema detecta stock bajo → Crea alerta
2. **Usuario cierra**: Elige tiempo de snooze (ej: 30min)
3. **Pausa**: Alerta no reaparece por 30 minutos
4. **Verificación**: Después de 30min, verifica si stock cambió
5. **Reactivación**: Solo muestra alerta si el stock cambió o empeoró

#### Casos Especiales
- **Stock mejoró**: Si el stock subió por encima del umbral, no reaparece
- **Stock empeoró**: Si bajó más, aparece inmediatamente
- **Stock igual**: Respeta el tiempo de snooze completo
- **Cambio mínimo**: ±1 unidad se considera sin cambio significativo

### 🔄 **Configuración Actual**

#### Tiempos de Snooze Disponibles
- **15 minutos**: Para revisión rápida
- **30 minutos**: Tiempo por defecto (balanceado)
- **1 hora**: Para tareas que requieren más tiempo
- **4 horas**: Para planificación de reposición

#### Limpieza Automática
- **Verificación**: Cada 60 segundos
- **Elimina**: Snoozes expirados automáticamente
- **Optimización**: Evita acumulación de datos innecesarios

### 📋 **Archivos Modificados**

#### Nuevas Funcionalidades
- `src/contexts/NotificationContext.tsx` - Sistema de snooze principal
- `src/components/notifications/NotificationToast.tsx` - Interfaz de snooze
- `src/components/notifications/StockNotificationSettings.tsx` - Documentación del sistema

#### Nuevos Tipos TypeScript
```typescript
interface SnoozedAlert {
  productId: number
  snoozedUntil: Date
  lastStock: number
}

interface NotificationContextType {
  // ... funciones existentes
  dismissStockAlert: (productId: number, snoozeMinutes?: number) => void
}
```

## ✅ **Resultado Final**

Ahora cuando cierres una notificación de stock:
1. **Desaparece inmediatamente** (como antes)
2. **No vuelve a aparecer** por el tiempo que elijas
3. **Se reactiva inteligentemente** solo si es necesario
4. **Respeta tu flujo de trabajo** sin interrupciones constantes

El sistema es ahora **no intrusivo** y **respeta las decisiones del usuario**, mientras mantiene la funcionalidad de alerta crítica cuando realmente es necesario. 🎯