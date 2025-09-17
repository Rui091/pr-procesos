#!/usr/bin/env node

// Script para solucionar el problema de foreign key constraint de cliente
// Ejecutar con: node fix_cliente_org_constraint.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_ORG_ID = '550e8400-e29b-41d4-a716-446655440000'
const DEFAULT_ORG_NAME = 'Organización Principal'

async function fixOrganizationConstraint() {
  console.log('🔧 === SOLUCIONANDO CONSTRAINT DE CLIENTE ===\n')

  try {
    // 1. Verificar organizaciones existentes
    console.log('1️⃣ Verificando organizaciones existentes...')
    const { data: orgs, error: orgError } = await supabase
      .from('org')
      .select('id, nombre')

    if (orgError) {
      console.error('❌ Error consultando organizaciones:', orgError.message)
      return false
    }

    console.log(`   Organizaciones encontradas: ${orgs?.length || 0}`)
    orgs?.forEach(org => console.log(`   - ${org.id}: ${org.nombre}`))

    // 2. Verificar si existe la organización por defecto
    console.log('\n2️⃣ Verificando organización por defecto...')
    const defaultOrgExists = orgs?.some(org => org.id === DEFAULT_ORG_ID)
    
    if (defaultOrgExists) {
      console.log('   ✅ Organización por defecto ya existe')
    } else {
      console.log('   ⚠️ Organización por defecto no existe, creándola...')
      
      const { data: newOrg, error: createError } = await supabase
        .from('org')
        .insert({
          id: DEFAULT_ORG_ID,
          nombre: DEFAULT_ORG_NAME
        })
        .select()
        .single()

      if (createError) {
        console.error('   ❌ Error creando organización:', createError.message)
        return false
      }

      console.log('   ✅ Organización por defecto creada:', newOrg.nombre)
    }

    // 3. Buscar clientes huérfanos
    console.log('\n3️⃣ Buscando clientes huérfanos...')
    const { data: allClients, error: clientsError } = await supabase
      .from('cliente')
      .select('id, nombre, org_id')

    if (clientsError) {
      console.error('❌ Error consultando clientes:', clientsError.message)
      return false
    }

    const updatedOrgs = await supabase.from('org').select('id')
    const validOrgIds = new Set((updatedOrgs.data || []).map(org => org.id))
    
    const orphanClients = allClients?.filter(client => !validOrgIds.has(client.org_id)) || []

    if (orphanClients.length === 0) {
      console.log('   ✅ No se encontraron clientes huérfanos')
    } else {
      console.log(`   ⚠️ Se encontraron ${orphanClients.length} clientes huérfanos:`)
      orphanClients.forEach(client => {
        console.log(`   - Cliente ${client.id}: ${client.nombre} (org_id: ${client.org_id})`)
      })

      // 4. Actualizar clientes huérfanos
      console.log('\n4️⃣ Actualizando clientes huérfanos...')
      const { error: updateError } = await supabase
        .from('cliente')
        .update({ org_id: DEFAULT_ORG_ID })
        .in('id', orphanClients.map(c => c.id))

      if (updateError) {
        console.error('❌ Error actualizando clientes:', updateError.message)
        return false
      }

      console.log(`   ✅ Se actualizaron ${orphanClients.length} clientes`)
    }

    // 5. Buscar user_roles huérfanos
    console.log('\n5️⃣ Buscando user_roles huérfanos...')
    const { data: allUserRoles, error: userRolesError } = await supabase
      .from('user_role')
      .select('user_id, org_id, role')

    if (userRolesError) {
      console.error('❌ Error consultando user_roles:', userRolesError.message)
      return false
    }

    const orphanUserRoles = allUserRoles?.filter(ur => !validOrgIds.has(ur.org_id)) || []

    if (orphanUserRoles.length === 0) {
      console.log('   ✅ No se encontraron user_roles huérfanos')
    } else {
      console.log(`   ⚠️ Se encontraron ${orphanUserRoles.length} user_roles huérfanos:`)
      orphanUserRoles.forEach(ur => {
        console.log(`   - User ${ur.user_id}: ${ur.role} (org_id: ${ur.org_id})`)
      })

      // 6. Actualizar user_roles huérfanos
      console.log('\n6️⃣ Actualizando user_roles huérfanos...')
      for (const ur of orphanUserRoles) {
        const { error: updateRoleError } = await supabase
          .from('user_role')
          .update({ org_id: DEFAULT_ORG_ID })
          .eq('user_id', ur.user_id)

        if (updateRoleError) {
          console.error(`❌ Error actualizando user_role para ${ur.user_id}:`, updateRoleError.message)
        }
      }

      console.log(`   ✅ Se actualizaron ${orphanUserRoles.length} user_roles`)
    }

    // 7. Verificación final
    console.log('\n7️⃣ Verificación final...')
    const { data: finalClients, error: finalError } = await supabase
      .from('cliente')
      .select('id')

    if (finalError) {
      console.error('❌ Error en verificación final:', finalError.message)
      return false
    }

    console.log(`   ✅ Total de clientes: ${finalClients?.length || 0}`)
    console.log('   ✅ Todos los clientes ahora tienen org_id válido')

    console.log('\n🎉 === PROBLEMA SOLUCIONADO ===')
    console.log('Ahora deberías poder crear y actualizar clientes sin errores de foreign key.')
    
    return true

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

// Ejecutar el script
fixOrganizationConstraint()
  .then(success => {
    if (success) {
      console.log('\n✅ Script completado exitosamente')
      process.exit(0)
    } else {
      console.log('\n❌ Script completado con errores')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Error ejecutando script:', error)
    process.exit(1)
  })
