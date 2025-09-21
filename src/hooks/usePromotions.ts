import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Promocion as PromocionDB } from '../lib/database.types';

export interface Promocion extends PromocionDB {
  // Relaciones
  producto?: {
    id: number;
    nombre: string;
    precio: number;
  };
  cliente?: {
    id: number;
    nombre: string;
  };
}

export interface PromocionFormData {
  nombre: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'monto_fijo' | '2x1' | 'buy_x_get_y';
  valor_descuento: number;
  cantidad_minima: number;
  producto_id?: number;
  cliente_id?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
}

export const usePromotions = () => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { org } = useAuth();

  // Cargar promociones
  const fetchPromociones = async () => {
    if (!org?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('promocion')
        .select(`
          *,
          producto:producto_id (
            id,
            nombre,
            precio
          ),
          cliente:cliente_id (
            id,
            nombre
          )
        `)
        .eq('org_id', org.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPromociones(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear promoción
  const createPromocion = async (formData: PromocionFormData): Promise<boolean> => {
    console.log('🚀 Intentando crear promoción con datos:', formData);
    console.log('📍 Organización actual:', org);
    
    if (!org?.id) {
      console.error('❌ No hay organización disponible');
      setError('No hay organización disponible');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToInsert = {
        ...formData,
        org_id: org.id,
      };
      
      console.log('📝 Datos a insertar:', dataToInsert);

      // @ts-ignore - Temporal hasta crear tabla promocion en BD
      const { data, error: insertError } = await supabase
        .from('promocion')
        // @ts-ignore - Temporal hasta crear tabla promocion en BD
        .insert(dataToInsert)
        .select();

      console.log('📊 Respuesta de Supabase:', { data, error: insertError });

      if (insertError) {
        console.error('❌ Error al insertar:', insertError);
        throw insertError;
      }
      
      console.log('✅ Promoción creada exitosamente');
      await fetchPromociones();
      return true;
    } catch (err: any) {
      console.error('❌ Error en createPromocion:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar promoción
  const updatePromocion = async (id: number, formData: PromocionFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // @ts-ignore - Temporal hasta crear tabla promocion en BD
      const { error: updateError } = await supabase
        .from('promocion')
        // @ts-ignore - Temporal hasta crear tabla promocion en BD
        .update(formData)
        .eq('id', id);

      if (updateError) throw updateError;
      
      await fetchPromociones();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar promoción
  const deletePromocion = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('promocion')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      await fetchPromociones();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Activar/Desactivar promoción
  const togglePromocion = async (id: number, activo: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // @ts-ignore - Temporal hasta crear tabla promocion en BD
      const { error: updateError } = await supabase
        .from('promocion')
        // @ts-ignore - Temporal hasta crear tabla promocion en BD
        .update({ activo })
        .eq('id', id);

      if (updateError) throw updateError;
      
      await fetchPromociones();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener promociones activas para un producto específico
  const getPromocionesByProducto = async (productoId: number): Promise<Promocion[]> => {
    if (!org?.id) return [];

    try {
      const { data, error: fetchError } = await supabase
        .from('promocion')
        .select('*')
        .eq('org_id', org.id)
        .eq('activo', true)
        .or(`producto_id.is.null,producto_id.eq.${productoId}`)
        .lte('fecha_inicio', new Date().toISOString().split('T')[0])
        .or(`fecha_fin.is.null,fecha_fin.gte.${new Date().toISOString().split('T')[0]}`);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error('Error al obtener promociones por producto:', err);
      return [];
    }
  };

  // Calcular descuento para un item específico
  const calcularDescuento = (
    precio: number,
    cantidad: number,
    promocion: Promocion
  ): { descuentoUnitario: number; descuentoTotal: number } => {
    let descuentoUnitario = 0;
    let descuentoTotal = 0;

    if (cantidad < promocion.cantidad_minima) {
      return { descuentoUnitario: 0, descuentoTotal: 0 };
    }

    switch (promocion.tipo_descuento) {
      case 'porcentaje':
        descuentoUnitario = precio * (promocion.valor_descuento / 100);
        descuentoTotal = descuentoUnitario * cantidad;
        break;

      case 'monto_fijo':
        descuentoUnitario = Math.min(promocion.valor_descuento, precio);
        descuentoTotal = descuentoUnitario * cantidad;
        break;

      case '2x1':
        // Por cada 2 unidades, 1 es gratis
        const unidadesGratis = Math.floor(cantidad / 2);
        descuentoTotal = unidadesGratis * precio;
        descuentoUnitario = cantidad > 0 ? descuentoTotal / cantidad : 0;
        break;

      case 'buy_x_get_y':
        // Compra X cantidad mínima y obtén Y gratis
        if (cantidad >= promocion.cantidad_minima) {
          const ciclosCompletos = Math.floor(cantidad / promocion.cantidad_minima);
          const unidadesGratis = ciclosCompletos * promocion.valor_descuento;
          descuentoTotal = Math.min(unidadesGratis, cantidad) * precio;
          descuentoUnitario = cantidad > 0 ? descuentoTotal / cantidad : 0;
        }
        break;
    }

    return { descuentoUnitario, descuentoTotal };
  };

  // Validar fechas de promoción
  const validarFechas = (fechaInicio: string, fechaFin?: string): boolean => {
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    
    if (inicio < hoy) return false;
    
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (fin <= inicio) return false;
    }
    
    return true;
  };

  // Filtrar promociones
  const filtrarPromociones = (
    filtros: {
      busqueda?: string;
      tipo?: string;
      activo?: boolean;
      producto?: number;
    }
  ): Promocion[] => {
    return promociones.filter(promocion => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        if (!promocion.nombre.toLowerCase().includes(busqueda) &&
            !promocion.descripcion?.toLowerCase().includes(busqueda)) {
          return false;
        }
      }

      if (filtros.tipo && promocion.tipo_descuento !== filtros.tipo) {
        return false;
      }

      if (filtros.activo !== undefined && promocion.activo !== filtros.activo) {
        return false;
      }

      if (filtros.producto && promocion.producto_id !== filtros.producto) {
        return false;
      }

      return true;
    });
  };

  useEffect(() => {
    fetchPromociones();
  }, [org?.id]);

  return {
    promociones,
    loading,
    error,
    fetchPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion,
    togglePromocion,
    getPromocionesByProducto,
    calcularDescuento,
    validarFechas,
    filtrarPromociones,
  };
};