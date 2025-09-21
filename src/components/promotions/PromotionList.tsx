import React, { useState, useMemo } from 'react';
import { usePromotions, type Promocion } from '../../hooks/usePromotions';
import { formatDate } from '../../utils/formatters';

interface PromotionListProps {
  onEdit: (promocion: Promocion) => void;
  onNew: () => void;
}

const PromotionList: React.FC<PromotionListProps> = ({ onEdit, onNew }) => {
  const { promociones, loading, error, deletePromocion, togglePromocion, filtrarPromociones } = usePromotions();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    activo: undefined as boolean | undefined,
    producto: undefined as number | undefined,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Filtrar promociones basado en los filtros actuales
  const promocionesFiltradas = useMemo(() => {
    return filtrarPromociones(filtros);
  }, [promociones, filtros, filtrarPromociones]);

  const handleToggleActivo = async (id: number, activo: boolean) => {
    await togglePromocion(id, activo);
  };

  const handleDelete = async (id: number) => {
    const success = await deletePromocion(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const getTipoDescuentoLabel = (tipo: string) => {
    switch (tipo) {
      case 'porcentaje': return 'Porcentaje';
      case 'monto_fijo': return 'Monto Fijo';
      case '2x1': return '2x1';
      case 'buy_x_get_y': return 'Compra X lleva Y';
      default: return tipo;
    }
  };

  const getTipoDescuentoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'porcentaje': return 'bg-blue-100 text-blue-800';
      case 'monto_fijo': return 'bg-green-100 text-green-800';
      case '2x1': return 'bg-purple-100 text-purple-800';
      case 'buy_x_get_y': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValorDescuentoDisplay = (promocion: Promocion) => {
    switch (promocion.tipo_descuento) {
      case 'porcentaje':
        return `${promocion.valor_descuento}%`;
      case 'monto_fijo':
        return `$${promocion.valor_descuento.toLocaleString()}`;
      case '2x1':
        return 'Automático';
      case 'buy_x_get_y':
        return `${promocion.valor_descuento} gratis`;
      default:
        return promocion.valor_descuento.toString();
    }
  };

  const isPromocionVigente = (promocion: Promocion) => {
    const hoy = new Date();
    const inicio = new Date(promocion.fecha_inicio);
    const fin = promocion.fecha_fin ? new Date(promocion.fecha_fin) : null;
    
    return promocion.activo && inicio <= hoy && (!fin || fin >= hoy);
  };

  const getEstadoPromocion = (promocion: Promocion) => {
    if (!promocion.activo) return { label: 'Inactiva', color: 'bg-gray-100 text-gray-800' };
    
    const hoy = new Date();
    const inicio = new Date(promocion.fecha_inicio);
    const fin = promocion.fecha_fin ? new Date(promocion.fecha_fin) : null;
    
    if (inicio > hoy) return { label: 'Programada', color: 'bg-yellow-100 text-yellow-800' };
    if (fin && fin < hoy) return { label: 'Expirada', color: 'bg-red-100 text-red-800' };
    
    return { label: 'Vigente', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre o descripción..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto Fijo</option>
              <option value="2x1">2x1</option>
              <option value="buy_x_get_y">Compra X lleva Y</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtros.activo === undefined ? '' : filtros.activo.toString()}
              onChange={(e) => setFiltros(prev => ({ 
                ...prev, 
                activo: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={onNew}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Nueva Promoción
            </button>
          </div>
        </div>
      </div>

      {/* Lista de promociones */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {promocionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay promociones {filtros.busqueda ? 'que coincidan con tu búsqueda' : 'registradas'}</p>
            <button
              onClick={onNew}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Crear Primera Promoción
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promoción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo / Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aplicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promocionesFiltradas.map((promocion) => {
                  const estado = getEstadoPromocion(promocion);
                  return (
                    <tr key={promocion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promocion.nombre}
                          </div>
                          {promocion.descripcion && (
                            <div className="text-sm text-gray-500">
                              {promocion.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoDescuentoBadgeColor(promocion.tipo_descuento)}`}>
                            {getTipoDescuentoLabel(promocion.tipo_descuento)}
                          </span>
                          <div className="text-sm text-gray-900">
                            {getValorDescuentoDisplay(promocion)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Min: {promocion.cantidad_minima} uds</div>
                          {promocion.producto && (
                            <div className="text-xs">Producto: {promocion.producto.nombre}</div>
                          )}
                          {promocion.cliente && (
                            <div className="text-xs">Cliente: {promocion.cliente.nombre}</div>
                          )}
                          {!promocion.producto && !promocion.cliente && (
                            <div className="text-xs text-green-600">Aplicación general</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Desde: {formatDate(promocion.fecha_inicio)}</div>
                          {promocion.fecha_fin ? (
                            <div>Hasta: {formatDate(promocion.fecha_fin)}</div>
                          ) : (
                            <div className="text-xs text-blue-600">Sin expiración</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estado.color}`}>
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onEdit(promocion)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActivo(promocion.id, !promocion.activo)}
                          className={`${promocion.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {promocion.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(promocion.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionList;