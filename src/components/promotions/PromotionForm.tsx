import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import type { PromocionFormData } from '../../hooks/usePromotions';

interface PromotionFormProps {
  initialData?: PromocionFormData;
  onSubmit: (data: PromocionFormData) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading
}) => {
  const { products } = useProducts();
  const { customers } = useCustomers();

  const [formData, setFormData] = useState<PromocionFormData>({
    nombre: '',
    descripcion: '',
    tipo_descuento: 'porcentaje',
    valor_descuento: 0,
    cantidad_minima: 1,
    producto_id: undefined,
    cliente_id: undefined,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    activo: true,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newValue = type === 'checkbox' ? checked : 
                   type === 'number' ? parseFloat(value) || 0 : 
                   value;

    // Si se cambia el tipo de descuento a 2x1, automáticamente poner valor en 0
    if (name === 'tipo_descuento' && value === '2x1') {
      setFormData(prev => ({
        ...prev,
        tipo_descuento: value as 'porcentaje' | 'monto_fijo' | '2x1' | 'buy_x_get_y',
        valor_descuento: 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validación específica por tipo de descuento
    if (formData.tipo_descuento !== '2x1' && formData.valor_descuento <= 0) {
      newErrors.valor_descuento = 'El valor del descuento debe ser mayor a 0';
    }

    if (formData.tipo_descuento === 'porcentaje' && formData.valor_descuento > 100) {
      newErrors.valor_descuento = 'El porcentaje no puede ser mayor a 100%';
    }

    if (formData.cantidad_minima < 1) {
      newErrors.cantidad_minima = 'La cantidad mínima debe ser al menos 1';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (formData.fecha_fin && formData.fecha_fin <= formData.fecha_inicio) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Datos del formulario:', formData);
    console.log('🔍 Ejecutando validación...');
    
    if (!validateForm()) {
      console.log('❌ Validación falló, errores:', errors);
      return;
    }

    console.log('✅ Validación pasó, enviando datos...');
    const success = await onSubmit(formData);
    console.log('📊 Resultado del envío:', success);
    
    if (success) {
      console.log('✅ Formulario enviado exitosamente, cerrando...');
      onCancel(); // Cerrar formulario después del éxito
    } else {
      console.log('❌ Error al enviar formulario');
    }
  };

  const getTipoDescuentoLabel = (tipo: string) => {
    switch (tipo) {
      case 'porcentaje': return 'Porcentaje (%)';
      case 'monto_fijo': return 'Monto Fijo ($)';
      case '2x1': return '2x1 (Segundo gratis)';
      case 'buy_x_get_y': return 'Compra X lleva Y gratis';
      default: return tipo;
    }
  };

  const getValorDescuentoPlaceholder = () => {
    switch (formData.tipo_descuento) {
      case 'porcentaje': return 'Ej: 10 (para 10%)';
      case 'monto_fijo': return 'Ej: 500 (descuento de $500)';
      case '2x1': return 'Automático (deje en 0)';
      case 'buy_x_get_y': return 'Cantidad gratuita (Ej: 1)';
      default: return '';
    }
  };

  const getValorDescuentoHelp = () => {
    switch (formData.tipo_descuento) {
      case 'porcentaje': return 'Porcentaje de descuento (0-100)';
      case 'monto_fijo': return 'Cantidad fija de descuento en pesos';
      case '2x1': return 'Se aplica automáticamente: por cada 2 unidades, 1 es gratis';
      case 'buy_x_get_y': return 'Por cada [cantidad mínima] comprada, obtiene [valor] gratis';
      default: return '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Editar Promoción' : 'Nueva Promoción'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Ej: Descuento de verano"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Descuento *
            </label>
            <select
              name="tipo_descuento"
              value={formData.tipo_descuento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto Fijo ($)</option>
              <option value="2x1">2x1</option>
              <option value="buy_x_get_y">Compra X lleva Y</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Descripción opcional de la promoción"
          />
        </div>

        {/* Configuración del descuento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {getTipoDescuentoLabel(formData.tipo_descuento)} *
            </label>
            <input
              type="number"
              name="valor_descuento"
              value={formData.valor_descuento}
              onChange={handleChange}
              min="0"
              step={formData.tipo_descuento === 'porcentaje' ? '0.01' : '1'}
              max={formData.tipo_descuento === 'porcentaje' ? '100' : undefined}
              disabled={formData.tipo_descuento === '2x1'}
              className={`mt-1 block w-full rounded-md border ${
                errors.valor_descuento ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                formData.tipo_descuento === '2x1' ? 'bg-gray-100' : ''
              }`}
              placeholder={getValorDescuentoPlaceholder()}
            />
            <p className="mt-1 text-xs text-gray-500">{getValorDescuentoHelp()}</p>
            {errors.valor_descuento && (
              <p className="mt-1 text-sm text-red-600">{errors.valor_descuento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad Mínima *
            </label>
            <input
              type="number"
              name="cantidad_minima"
              value={formData.cantidad_minima}
              onChange={handleChange}
              min="1"
              className={`mt-1 block w-full rounded-md border ${
                errors.cantidad_minima ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Cantidad mínima para aplicar la promoción
            </p>
            {errors.cantidad_minima && (
              <p className="mt-1 text-sm text-red-600">{errors.cantidad_minima}</p>
            )}
          </div>
        </div>

        {/* Aplicación específica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Producto Específico
            </label>
            <select
              name="producto_id"
              value={formData.producto_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los productos</option>
              {products.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - ${producto.precio}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Deje vacío para aplicar a todos los productos
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente Específico
            </label>
            <select
              name="cliente_id"
              value={formData.cliente_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los clientes</option>
              {customers.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Deje vacío para aplicar a todos los clientes
            </p>
          </div>
        </div>

        {/* Fechas de vigencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.fecha_inicio && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Fin
            </label>
            <input
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.fecha_fin ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Deje vacío para que no expire
            </p>
            {errors.fecha_fin && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_fin}</p>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Promoción activa
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')} Promoción
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;