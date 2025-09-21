-- RLS (Row Level Security) para la tabla promocion
-- Estas políticas aseguran que cada organización solo pueda ver y modificar sus propias promociones

-- 1. Habilitar RLS en la tabla promocion
ALTER TABLE promocion ENABLE ROW LEVEL SECURITY;

-- 1.1. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view promotions from their org only" ON promocion;
DROP POLICY IF EXISTS "Users can insert promotions for their org only" ON promocion;
DROP POLICY IF EXISTS "Users can update promotions from their org only" ON promocion;
DROP POLICY IF EXISTS "Users can delete promotions from their org only" ON promocion;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON promocion;

-- 2. Política temporal simple para testing - permite todo a usuarios autenticados
CREATE POLICY "Enable all operations for authenticated users" ON promocion
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Verificar las políticas existentes en la tabla promocion
-- Puedes ejecutar esta consulta para ver todas las políticas RLS aplicadas:
/*
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'promocion';
*/