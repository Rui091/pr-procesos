-- Script para diagnosticar y resolver el problema de foreign key constraint
-- del cliente con org_id

-- 1. Verificar qué organizaciones existen actualmente
SELECT 'Organizaciones existentes:' as status;
SELECT id, nombre, created_at FROM org ORDER BY created_at;

-- 2. Verificar si existe la organización por defecto que usa el código
SELECT 'Verificando organización por defecto:' as status;
SELECT EXISTS(
  SELECT 1 FROM org WHERE id = '550e8400-e29b-41d4-a716-446655440000'
) as existe_org_defecto;

-- 3. Verificar clientes que tienen org_id que no existe en la tabla org
SELECT 'Clientes con org_id inválido:' as status;
SELECT c.id, c.nombre, c.org_id, 'NO EXISTE' as estado_org
FROM cliente c
LEFT JOIN org o ON c.org_id = o.id
WHERE o.id IS NULL;

-- 4. Verificar user_roles que tienen org_id que no existe
SELECT 'User roles con org_id inválido:' as status;
SELECT ur.user_id, ur.org_id, ur.role, 'NO EXISTE' as estado_org
FROM user_role ur
LEFT JOIN org o ON ur.org_id = o.id
WHERE o.id IS NULL;

-- 5. Crear la organización por defecto si no existe
INSERT INTO org (id, nombre, created_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Organización Principal',
  NOW()
) 
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar de nuevo si ahora existe
SELECT 'Verificando después de insertar:' as status;
SELECT id, nombre FROM org WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 7. Actualizar clientes huérfanos para usar la organización por defecto
UPDATE cliente 
SET org_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE org_id NOT IN (SELECT id FROM org);

-- 8. Actualizar user_roles huérfanos para usar la organización por defecto
UPDATE user_role 
SET org_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE org_id NOT IN (SELECT id FROM org);

-- 9. Mostrar resumen final
SELECT 'RESUMEN FINAL:' as status;
SELECT 'Organizaciones' as tabla, COUNT(*) as total FROM org
UNION ALL
SELECT 'Clientes' as tabla, COUNT(*) as total FROM cliente
UNION ALL
SELECT 'User Roles' as tabla, COUNT(*) as total FROM user_role;

-- 10. Verificar que no hay más violaciones de foreign key
SELECT 'Verificación final de integridad:' as status;
SELECT 
  'Clientes válidos' as tipo,
  COUNT(*) as cantidad
FROM cliente c
INNER JOIN org o ON c.org_id = o.id

UNION ALL

SELECT 
  'User roles válidos' as tipo,
  COUNT(*) as cantidad
FROM user_role ur
INNER JOIN org o ON ur.org_id = o.id;
