// Script para debuggear el problema de foreign key constraint de cliente
// Ejecutar en la consola del navegador cuando tengas el error

console.log('🔧 === DEBUG FOREIGN KEY CLIENTE ===')

// Importar supabase (ajustar la ruta según tu estructura)
import { supabase } from './src/lib/supabase.js'

const debugForeignKeyCliente = async () => {
  try {
    console.log('🔍 1. Verificando organizaciones existentes...')
    
    // Verificar qué organizaciones existen
    const { data: orgs, error: orgError } = await supabase
      .from('org')
      .select('id, nombre')
    
    if (orgError) {
      console.error('❌ Error consultando organizaciones:', orgError)
      return
    }
    
    console.log('✅ Organizaciones encontradas:', orgs)
    
    // Verificar si existe la organización por defecto
    const defaultOrgId = '550e8400-e29b-41d4-a716-446655440000'
    const defaultOrgExists = orgs?.some(org => org.id === defaultOrgId)
    
    console.log('🔍 2. Verificando organización por defecto...')
    console.log(`Org por defecto (${defaultOrgId}):`, defaultOrgExists ? '✅ EXISTE' : '❌ NO EXISTE')
    
    // Verificar la sesión actual y qué org_id se está usando
    console.log('🔍 3. Verificando sesión actual...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError)
      return
    }
    
    if (!session?.user) {
      console.log('⚠️ No hay sesión activa')
      return
    }
    
    console.log('✅ Usuario autenticado:', session.user.id)
    
    // Verificar el rol del usuario
    console.log('🔍 4. Verificando rol del usuario...')
    const { data: userRole, error: roleError } = await supabase
      .from('user_role')
      .select('org_id, role')
      .eq('user_id', session.user.id)
      .single()
    
    if (roleError) {
      console.error('❌ Error obteniendo rol:', roleError)
      console.log('⚠️ Esto podría ser el problema - el usuario no tiene rol asignado')
    } else {
      console.log('✅ Rol del usuario:', userRole)
      
      // Verificar si el org_id del usuario existe
      const userOrgExists = orgs?.some(org => org.id === userRole.org_id)
      console.log(`Org del usuario (${userRole.org_id}):`, userOrgExists ? '✅ EXISTE' : '❌ NO EXISTE')
    }
    
    // Intentar crear la organización por defecto si no existe
    if (!defaultOrgExists) {
      console.log('🔧 5. Creando organización por defecto...')
      
      const { data: newOrg, error: createOrgError } = await supabase
        .from('org')
        .insert({
          id: defaultOrgId,
          nombre: 'Organización Principal'
        })
        .select()
        .single()
      
      if (createOrgError) {
        console.error('❌ Error creando organización por defecto:', createOrgError)
      } else {
        console.log('✅ Organización por defecto creada:', newOrg)
      }
    }
    
    // Verificar clientes huérfanos
    console.log('🔍 6. Verificando clientes huérfanos...')
    const { data: orphanClients, error: orphanError } = await supabase
      .rpc('get_orphan_clients') // Esta función no existe, será una consulta manual
      .select('*')
    
    // Como la función RPC no existe, hacer la consulta manualmente
    const { data: allClients, error: clientsError } = await supabase
      .from('cliente')
      .select('id, nombre, org_id')
    
    if (!clientsError && allClients) {
      const orphans = []
      for (const client of allClients) {
        const orgExists = orgs?.some(org => org.id === client.org_id)
        if (!orgExists) {
          orphans.push(client)
        }
      }
      
      if (orphans.length > 0) {
        console.log('⚠️ Clientes huérfanos encontrados:', orphans)
        console.log('💡 Estos clientes tienen org_id que no existe en la tabla org')
      } else {
        console.log('✅ No se encontraron clientes huérfanos')
      }
    }
    
    console.log('🔧 === RESUMEN ===')
    console.log('Total organizaciones:', orgs?.length || 0)
    console.log('Org por defecto existe:', defaultOrgExists)
    console.log('Usuario tiene rol:', !roleError)
    console.log('Total clientes:', allClients?.length || 0)
    
    console.log('💡 RECOMENDACIONES:')
    if (!defaultOrgExists) {
      console.log('1. Ejecutar el script SQL fix_foreign_key_cliente.sql')
    }
    if (roleError) {
      console.log('2. Asignar un rol al usuario actual')
    }
    console.log('3. Verificar que el frontend use el org_id correcto al crear clientes')
    
  } catch (error) {
    console.error('❌ Error en debug:', error)
  }
}

// Función para intentar crear un cliente de prueba y ver el error exacto
const testCreateCliente = async () => {
  console.log('🧪 === PRUEBA DE CREACIÓN DE CLIENTE ===')
  
  try {
    const testClient = {
      nombre: 'Cliente de Prueba Debug',
      org_id: '550e8400-e29b-41d4-a716-446655440000', // org por defecto
      tipo_id: null,
      idnum: null,
      correo: null
    }
    
    console.log('🔧 Intentando crear cliente con datos:', testClient)
    
    const { data, error } = await supabase
      .from('cliente')
      .insert(testClient)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error exacto al crear cliente:', error)
      console.error('Código de error:', error.code)
      console.error('Mensaje:', error.message)
      console.error('Detalles:', error.details)
    } else {
      console.log('✅ Cliente creado exitosamente:', data)
      
      // Limpiar - eliminar el cliente de prueba
      const { error: deleteError } = await supabase
        .from('cliente')
        .delete()
        .eq('id', data.id)
      
      if (!deleteError) {
        console.log('🧹 Cliente de prueba eliminado')
      }
    }
    
  } catch (error) {
    console.error('❌ Excepción al crear cliente:', error)
  }
}

// Ejecutar ambas funciones
debugForeignKeyCliente()
  .then(() => testCreateCliente())
  .then(() => console.log('🏁 Debug completado'))
