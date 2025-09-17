// Script para probar la creación de cliente con el org_id correcto
// Ejecutar en la consola del navegador

console.log('🧪 === PRUEBA DE CLIENTE CON ORG_ID CORRECTO ===')

// Función para probar la creación de cliente
const testClienteConOrgCorrecta = async () => {
  try {
    // Importar supabase
    const { supabase } = await import('./src/lib/supabase.js')
    
    const orgIdCorrecta = '28681538-1cbb-4667-8deb-6bddb3dfb5d7'
    
    console.log('🔍 1. Verificando que la organización existe...')
    const { data: org, error: orgError } = await supabase
      .from('org')
      .select('id, nombre')
      .eq('id', orgIdCorrecta)
      .single()
    
    if (orgError) {
      console.error('❌ Error: La organización no existe:', orgError.message)
      return
    }
    
    console.log('✅ Organización encontrada:', org)
    
    console.log('🧪 2. Probando creación de cliente...')
    const clientePrueba = {
      nombre: 'Cliente de Prueba - Org Correcta',
      org_id: orgIdCorrecta,
      tipo_id: null,
      idnum: null,
      correo: null
    }
    
    console.log('📝 Datos del cliente:', clientePrueba)
    
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .insert(clientePrueba)
      .select()
      .single()
    
    if (clienteError) {
      console.error('❌ Error al crear cliente:', clienteError)
      console.error('Código:', clienteError.code)
      console.error('Mensaje:', clienteError.message)
      return
    }
    
    console.log('✅ Cliente creado exitosamente:', cliente)
    
    // Limpiar - eliminar el cliente de prueba
    console.log('🧹 3. Limpiando cliente de prueba...')
    const { error: deleteError } = await supabase
      .from('cliente')
      .delete()
      .eq('id', cliente.id)
    
    if (deleteError) {
      console.error('⚠️ Error eliminando cliente de prueba:', deleteError.message)
    } else {
      console.log('✅ Cliente de prueba eliminado')
    }
    
    console.log('🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===')
    console.log('💡 La solución funciona correctamente!')
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar la prueba
testClienteConOrgCorrecta()
