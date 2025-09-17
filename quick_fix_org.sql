-- QUICK FIX: Usar la organización real y corregir referencias huérfanas

-- 1. Verificar que la organización real existe
SELECT 'Verificando organización real:' as status;
SELECT id, nombre FROM org WHERE id = '28681538-1cbb-4667-8deb-6bddb3dfb5d7';

-- 2. Actualizar clientes huérfanos para usar la organización real
UPDATE cliente 
SET org_id = '28681538-1cbb-4667-8deb-6bddb3dfb5d7' 
WHERE org_id NOT IN (SELECT id FROM org) OR org_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Actualizar user_roles huérfanos para usar la organización real
UPDATE user_role 
SET org_id = '28681538-1cbb-4667-8deb-6bddb3dfb5d7' 
WHERE org_id NOT IN (SELECT id FROM org) OR org_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Verificar que todo está correcto
SELECT 'Organizaciones' as tabla, COUNT(*) as total FROM org
UNION ALL
SELECT 'Clientes' as tabla, COUNT(*) as total FROM cliente
UNION ALL
SELECT 'User Roles' as tabla, COUNT(*) as total FROM user_role;
