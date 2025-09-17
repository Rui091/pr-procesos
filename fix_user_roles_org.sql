-- Verificar y corregir user_roles para usar la organización correcta

-- 1. Ver todos los user_roles actuales
SELECT 'User roles actuales:' as status;
SELECT user_id, org_id, role, is_active FROM user_role;

-- 2. Ver si hay user_roles con org_id incorrecto
SELECT 'User roles con org_id incorrecto:' as status;
SELECT user_id, org_id, role 
FROM user_role 
WHERE org_id != '28681538-1cbb-4667-8deb-6bddb3dfb5d7';

-- 3. Actualizar todos los user_roles para usar la organización correcta
UPDATE user_role 
SET org_id = '28681538-1cbb-4667-8deb-6bddb3dfb5d7' 
WHERE org_id != '28681538-1cbb-4667-8deb-6bddb3dfb5d7';

-- 4. Verificar después de la actualización
SELECT 'User roles después de actualizar:' as status;
SELECT user_id, org_id, role, is_active FROM user_role;
