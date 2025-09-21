-- Script para agregar sistema de promociones y descuentos
-- US_008 - Promociones y descuentos

-- 1. Crear tabla de promociones
CREATE TABLE IF NOT EXISTS promocion (
    id SERIAL PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(50) NOT NULL CHECK (tipo_descuento IN ('porcentaje', 'monto_fijo', '2x1', 'buy_x_get_y')),
    valor_descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Para tipo porcentaje: valor entre 0-100
    -- Para monto_fijo: valor en pesos
    -- Para 2x1: valor = 0 (se calcula automáticamente)
    -- Para buy_x_get_y: valor = cantidad gratuita
    
    -- Condiciones de aplicación
    cantidad_minima INTEGER DEFAULT 1,
    producto_id INTEGER REFERENCES producto(id) ON DELETE CASCADE, -- NULL = aplica a todos
    cliente_id INTEGER REFERENCES cliente(id) ON DELETE CASCADE,   -- NULL = aplica a todos
    
    -- Vigencia
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    
    -- Estado
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar campos de descuento a la tabla venta
ALTER TABLE venta 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS descuento_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promociones_aplicadas JSONB DEFAULT '[]'::jsonb;

-- 3. Agregar campos de descuento a la tabla venta_item
ALTER TABLE venta_item 
ADD COLUMN IF NOT EXISTS precio_original DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS descuento_unitario DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promocion_id INTEGER REFERENCES promocion(id) ON DELETE SET NULL;

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_promocion_org_id ON promocion(org_id);
CREATE INDEX IF NOT EXISTS idx_promocion_activo ON promocion(activo);
CREATE INDEX IF NOT EXISTS idx_promocion_fechas ON promocion(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_promocion_producto ON promocion(producto_id);
CREATE INDEX IF NOT EXISTS idx_venta_item_promocion ON venta_item(promocion_id);

-- 5. Función para actualizar totales con descuentos
CREATE OR REPLACE FUNCTION actualizar_totales_venta()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular subtotal sin descuentos
    UPDATE venta 
    SET subtotal = (
        SELECT COALESCE(SUM(precio_unitario * cantidad), 0)
        FROM venta_item 
        WHERE venta_id = NEW.venta_id
    ),
    -- Calcular descuento total
    descuento_total = (
        SELECT COALESCE(SUM(descuento_unitario * cantidad), 0)
        FROM venta_item 
        WHERE venta_id = NEW.venta_id
    )
    WHERE id = NEW.venta_id;
    
    -- Actualizar total final
    UPDATE venta 
    SET total = subtotal - descuento_total
    WHERE id = NEW.venta_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear triggers para actualizar totales automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_totales_insert ON venta_item;
CREATE TRIGGER trigger_actualizar_totales_insert
    AFTER INSERT ON venta_item
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_totales_venta();

DROP TRIGGER IF EXISTS trigger_actualizar_totales_update ON venta_item;
CREATE TRIGGER trigger_actualizar_totales_update
    AFTER UPDATE ON venta_item
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_totales_venta();

DROP TRIGGER IF EXISTS trigger_actualizar_totales_delete ON venta_item;
CREATE TRIGGER trigger_actualizar_totales_delete
    AFTER DELETE ON venta_item
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_totales_venta();

-- 7. Insertar algunas promociones de ejemplo
INSERT INTO promocion (org_id, nombre, descripcion, tipo_descuento, valor_descuento, cantidad_minima, activo)
SELECT 
    org.id,
    'Descuento 10%',
    'Descuento del 10% en todas las compras',
    'porcentaje',
    10.00,
    1,
    false -- Desactivado por defecto
FROM org
WHERE NOT EXISTS (
    SELECT 1 FROM promocion WHERE nombre = 'Descuento 10%'
);

INSERT INTO promocion (org_id, nombre, descripcion, tipo_descuento, valor_descuento, cantidad_minima, activo)
SELECT 
    org.id,
    '2x1 Productos',
    'Compra 2 y lleva 1 gratis',
    '2x1',
    0,
    2,
    false -- Desactivado por defecto
FROM org
WHERE NOT EXISTS (
    SELECT 1 FROM promocion WHERE nombre = '2x1 Productos'
);

-- 8. Comentarios para documentación
COMMENT ON TABLE promocion IS 'Tabla para gestionar promociones y descuentos';
COMMENT ON COLUMN promocion.tipo_descuento IS 'Tipos: porcentaje, monto_fijo, 2x1, buy_x_get_y';
COMMENT ON COLUMN promocion.valor_descuento IS 'Valor del descuento según el tipo';
COMMENT ON COLUMN venta.subtotal IS 'Total antes de descuentos';
COMMENT ON COLUMN venta.descuento_total IS 'Total de descuentos aplicados';
COMMENT ON COLUMN venta.promociones_aplicadas IS 'JSON con las promociones aplicadas';
COMMENT ON COLUMN venta_item.precio_original IS 'Precio antes de descuentos';
COMMENT ON COLUMN venta_item.descuento_unitario IS 'Descuento por unidad de producto';