# 🔍 Sistema de Búsqueda de Inventario

## Descripción
Se ha implementado un sistema completo de búsqueda en la página de inventario que permite buscar productos por nombre o código con funcionalidades avanzadas.

## ✨ Funcionalidades Implementadas

### 1. **Barra de Búsqueda Mejorada**
- **Debouncing**: Búsqueda optimizada con retraso de 300ms para evitar consultas excesivas
- **Búsqueda en tiempo real**: Los resultados se actualizan automáticamente mientras escribes
- **Botón de limpiar**: Icono X para limpiar la búsqueda rápidamente
- **Tecla Escape**: Presiona Esc para limpiar la búsqueda
- **Estados visuales**: Cambios de color y animaciones al enfocar

### 2. **Búsqueda por Múltiples Campos**
- **Código de producto**: Busca en el campo `codigo`
- **Nombre de producto**: Busca en el campo `nombre`
- **Búsqueda insensible a mayúsculas**: No importa si escribes en mayúsculas o minúsculas

### 3. **Estadísticas Dinámicas**
- **Total de productos**: Se actualiza según los resultados filtrados
- **Valor total**: Calculado solo para productos mostrados
- **Alertas de stock bajo**: Contadores de productos con stock crítico
- **Productos sin stock**: Identificación de productos agotados

### 4. **Ordenamiento Avanzado**
- **Por nombre**: Alfabético A-Z o Z-A
- **Por código**: Alfanumérico A-Z o Z-A
- **Por stock**: Menor a mayor o mayor a menor
- **Por valor total**: Menor a mayor o mayor a menor
- **Indicadores visuales**: Flechas que muestran la dirección del orden

### 5. **Integración con Alertas de Stock**
- **Colores de fila**: Productos con stock bajo tienen fondo coloreado
- **Bordes laterales**: Indicadores visuales para productos críticos
- **Iconos de alerta**: Símbolos diferenciados por nivel de criticidad
- **Mensajes informativos**: Descripciones claras del estado del stock

## 🎯 Cómo Usar

### Búsqueda Básica
```
1. Ve a la página "Inventario"
2. Escribe en la barra de búsqueda
3. Los resultados se filtran automáticamente
4. Presiona "Esc" o el botón X para limpiar
```

### Ordenamiento
```
1. Haz clic en cualquier encabezado de columna
2. La primera vez ordena ascendente (A-Z)
3. El segundo clic ordena descendente (Z-A)
4. Las flechas indican la dirección actual
```

### Ejemplos de Búsqueda
- **Por código**: `PROD001`, `ABC`, `123`
- **Por nombre**: `Coca Cola`, `laptop`, `samsung`
- **Parcial**: `coca` encuentra "Coca Cola"
- **Mixto**: `PR` encuentra códigos que empiecen por PR

## 🛠️ Componentes Técnicos

### **ProductSearch** (Mejorado)
```tsx
<ProductSearch
  onSearch={setSearchQuery}
  placeholder="Buscar por nombre o código..."
  className="w-full"
  debounceMs={300}        // Opcional: tiempo de debounce
  showFilters={false}     // Opcional: mostrar filtros adicionales
/>
```

### **InventoryView** (Actualizado)
- Estado de búsqueda: `searchQuery`
- Filtrado con `useMemo` para optimizar rendimiento
- Ordenamiento dinámico con múltiples campos
- Estadísticas calculadas en tiempo real

### **Hooks Utilizados**
- `useStockAlerts`: Para identificar productos con stock bajo
- `useInventory`: Para cargar datos del inventario
- `useState`: Para manejar estado de búsqueda y ordenamiento
- `useMemo`: Para optimizar filtrado y cálculos

## 📊 Estadísticas Mostradas

1. **Total Productos**: Cantidad de productos que coinciden con la búsqueda
2. **Valor Total**: Suma del valor de todos los productos filtrados
3. **Stock Bajo**: Productos con stock ≤ 15 unidades
4. **Sin Stock**: Productos con stock = 0

## 🎨 Estados Visuales

### **Productos Normales**
- Fondo blanco
- Hover gris claro

### **Stock Crítico** (≤ 5 unidades)
- Fondo rojo claro
- Borde izquierdo rojo
- Icono de peligro

### **Stock Bajo** (≤ 10 unidades)
- Fondo amarillo claro
- Borde izquierdo amarillo
- Icono de advertencia

### **Stock en Advertencia** (≤ 15 unidades)
- Fondo naranja claro
- Borde izquierdo naranja
- Icono de información

## ⚡ Optimizaciones

### **Debouncing**
- Evita búsquedas excesivas mientras el usuario escribe
- Configurable (default: 300ms)
- Mejora el rendimiento y reduce carga del servidor

### **Memoización**
- `useMemo` para filtrado y ordenamiento
- Recalcula solo cuando cambian dependencias
- Mantiene fluidez en la interfaz

### **Estados de Carga**
- Skeleton loading mientras cargan datos
- Estados de error con mensajes claros
- Indicadores de estado vacío

## 🔧 Configuración

### **Umbrales de Stock** (configurables en `constants.ts`)
```typescript
export const STOCK_ALERTS = {
  CRITICAL_THRESHOLD: 5,   // Stock crítico
  LOW_THRESHOLD: 10,       // Stock bajo
  WARNING_THRESHOLD: 15,   // Advertencia
}
```

### **Debounce Timing**
```typescript
// En ProductSearch
<ProductSearch debounceMs={300} />  // 300ms por defecto
```

## 🧪 Testing

### **Casos de Prueba**
1. **Búsqueda vacía**: Debe mostrar todos los productos
2. **Búsqueda por código**: `PROD001` debe encontrar productos específicos
3. **Búsqueda por nombre**: `laptop` debe encontrar productos con ese nombre
4. **Búsqueda parcial**: `coca` debe encontrar "Coca Cola"
5. **Búsqueda sin resultados**: Debe mostrar mensaje de "No encontrado"
6. **Ordenamiento**: Cada columna debe ordenar correctamente
7. **Estadísticas**: Deben actualizar según filtros aplicados

### **Datos de Prueba Sugeridos**
```sql
INSERT INTO producto (codigo, nombre, precio, stock, org_id) VALUES
('PROD001', 'Coca Cola 350ml', 2500, 3, 'tu-org-id'),    -- Crítico
('PROD002', 'Pepsi 350ml', 2300, 8, 'tu-org-id'),        -- Bajo  
('PROD003', 'Laptop HP', 1500000, 12, 'tu-org-id'),      -- Advertencia
('PROD004', 'Mouse Inalámbrico', 45000, 25, 'tu-org-id'), -- Normal
('ABC001', 'Teclado Mecánico', 120000, 0, 'tu-org-id');   -- Sin stock
```

## 🚀 Próximas Mejoras

1. **Filtros avanzados**: Por rango de precios, categorías
2. **Búsqueda por código de barras**: Integración con scanner
3. **Exportar resultados**: PDF/Excel de productos filtrados
4. **Búsqueda guardada**: Guardar búsquedas frecuentes
5. **Búsqueda por voz**: Integración con Speech API
6. **Sugerencias automáticas**: Autocompletado inteligente

## 🎯 Beneficios para el Usuario

✅ **Encontrar productos rápidamente** sin navegar por listas largas
✅ **Identificar problemas de stock** con indicadores visuales claros  
✅ **Gestionar inventario eficientemente** con ordenamiento y filtros
✅ **Tomar decisiones informadas** con estadísticas en tiempo real
✅ **Experiencia fluida** con búsqueda en tiempo real y debouncing