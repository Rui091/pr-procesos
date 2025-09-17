// SOLUCIÓN INMEDIATA: Ejecutar en la consola del navegador
// Copia y pega este código en la consola del navegador cuando tu aplicación esté cargada

console.log('🔧 === SOLUCIONANDO FOREIGN KEY CONSTRAINT ===');

// Función para solucionar el problema
const solucionarConstraint = async () => {
  try {
    // Importar supabase desde tu aplicación
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('1️⃣ Verificando organizaciones existentes...');
    
    // Verificar organizaciones existentes
    const { data: orgs, error: orgError } = await supabase
      .from('org')
      .select('id, nombre');
    
    if (orgError) {
      console.error('❌ Error consultando organizaciones:', orgError.message);
      console.log('💡 Posibles causas:');
      console.log('   - No tienes permisos para leer la tabla org');
      console.log('   - La tabla org no existe');
      console.log('   - Problemas de autenticación');
      return false;
    }
    
    console.log(`✅ Organizaciones encontradas: ${orgs?.length || 0}`);
    orgs?.forEach(org => console.log(`   - ${org.id}: ${org.nombre}`));
    
    // Verificar si existe la organización por defecto
    const DEFAULT_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
    const defaultOrgExists = orgs?.some(org => org.id === DEFAULT_ORG_ID);
    
    console.log('2️⃣ Verificando organización por defecto...');
    
    if (defaultOrgExists) {
      console.log('✅ La organización por defecto ya existe');
    } else {
      console.log('⚠️ La organización por defecto no existe. Creándola...');
      
      const { data: newOrg, error: createError } = await supabase
        .from('org')
        .insert({
          id: DEFAULT_ORG_ID,
          nombre: 'Organización Principal'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creando organización:', createError.message);
        console.log('💡 Esto podría ser porque:');
        console.log('   - No tienes permisos de escritura en la tabla org');
        console.log('   - Ya existe pero con datos diferentes');
        console.log('   - Problemas de autenticación');
        return false;
      }
      
      console.log('✅ Organización por defecto creada:', newOrg);
    }
    
    console.log('3️⃣ Verificando tu sesión actual...');
    
    // Verificar sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError.message);
      return false;
    }
    
    if (!session?.user) {
      console.log('⚠️ No hay sesión activa');
      return false;
    }
    
    console.log('✅ Usuario autenticado:', session.user.email);
    
    console.log('4️⃣ Verificando tu rol y organización...');
    
    // Verificar rol del usuario
    const { data: userRole, error: roleError } = await supabase
      .from('user_role')
      .select('org_id, role')
      .eq('user_id', session.user.id)
      .single();
    
    if (roleError) {
      console.error('⚠️ Error obteniendo rol:', roleError.message);
      console.log('💡 Esto significa que tu usuario no tiene rol asignado');
      console.log('💡 Creando rol por defecto...');
      
      // Crear rol por defecto para el usuario
      const { data: newRole, error: createRoleError } = await supabase
        .from('user_role')
        .insert({
          user_id: session.user.id,
          org_id: DEFAULT_ORG_ID,
          role: 'admin',
          is_active: true
        })
        .select()
        .single();
      
      if (createRoleError) {
        console.error('❌ Error creando rol:', createRoleError.message);
        return false;
      }
      
      console.log('✅ Rol creado para el usuario:', newRole);
    } else {
      console.log('✅ Usuario tiene rol:', userRole);
      
      // Verificar si el org_id del usuario es válido
      const userOrgExists = orgs?.some(org => org.id === userRole.org_id);
      if (!userOrgExists) {
        console.log('⚠️ El org_id del usuario no es válido, actualizando...');
        
        const { error: updateRoleError } = await supabase
          .from('user_role')
          .update({ org_id: DEFAULT_ORG_ID })
          .eq('user_id', session.user.id);
        
        if (updateRoleError) {
          console.error('❌ Error actualizando rol:', updateRoleError.message);
          return false;
        }
        
        console.log('✅ Rol actualizado con org_id válido');
      }
    }
    
    console.log('5️⃣ Probando crear un cliente...');
    
    // Probar crear un cliente
    const testClient = {
      nombre: 'Cliente de Prueba - ' + new Date().toLocaleTimeString(),
      org_id: DEFAULT_ORG_ID,
      tipo_id: null,
      idnum: null,
      correo: null
    };
    
    const { data: newClient, error: clientError } = await supabase
      .from('cliente')
      .insert(testClient)
      .select()
      .single();
    
    if (clientError) {
      console.error('❌ Aún hay error creando cliente:', clientError.message);
      console.log('💡 Error específico:', clientError);
      return false;
    }
    
    console.log('✅ Cliente de prueba creado exitosamente:', newClient);
    
    // Limpiar - eliminar cliente de prueba
    const { error: deleteError } = await supabase
      .from('cliente')
      .delete()
      .eq('id', newClient.id);
    
    if (!deleteError) {
      console.log('🧹 Cliente de prueba eliminado');
    }
    
    console.log('🎉 === PROBLEMA SOLUCIONADO ===');
    console.log('✅ Ahora puedes crear clientes sin problemas');
    console.log('✅ Tu usuario tiene rol y organización asignados');
    console.log('✅ La organización por defecto existe');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
};

// Ejecutar la solución
solucionarConstraint()
  .then(success => {
    if (success) {
      console.log('\n🎯 LISTO! El problema ha sido solucionado.');
      console.log('Recarga la página e intenta crear un cliente nuevamente.');
    } else {
      console.log('\n❌ No se pudo solucionar automáticamente.');
      console.log('💡 Intenta ejecutar el SQL manualmente en Supabase:');
      console.log(`
-- Ejecutar en el SQL Editor de Supabase:
INSERT INTO org (id, nombre, created_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Organización Principal',
  NOW()
) 
ON CONFLICT (id) DO NOTHING;
      `);
    }
  });
