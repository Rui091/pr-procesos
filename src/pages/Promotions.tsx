import React, { useState } from 'react';
import { PromotionList, PromotionForm } from '../components/promotions';
import { usePromotions, type Promocion, type PromocionFormData } from '../hooks/usePromotions';

const Promotions: React.FC = () => {
  const { createPromocion, updatePromocion, loading, error } = usePromotions();
  
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingPromotion, setEditingPromotion] = useState<Promocion | null>(null);

  const handleNewPromotion = () => {
    setEditingPromotion(null);
    setActiveTab('form');
  };

  const handleEditPromotion = (promocion: Promocion) => {
    setEditingPromotion(promocion);
    setActiveTab('form');
  };

  const handleSubmitPromotion = async (formData: PromocionFormData): Promise<boolean> => {
    let success = false;
    
    if (editingPromotion) {
      success = await updatePromocion(editingPromotion.id, formData);
    } else {
      success = await createPromocion(formData);
    }

    if (success) {
      setActiveTab('list');
      setEditingPromotion(null);
    }

    return success;
  };

  const handleCancelForm = () => {
    setActiveTab('list');
    setEditingPromotion(null);
  };

  // Convertir Promocion a PromocionFormData para edición
  const getInitialFormData = (promocion: Promocion): PromocionFormData => {
    return {
      nombre: promocion.nombre,
      descripcion: promocion.descripcion || '',
      tipo_descuento: promocion.tipo_descuento,
      valor_descuento: promocion.valor_descuento,
      cantidad_minima: promocion.cantidad_minima,
      producto_id: promocion.producto_id || undefined,
      cliente_id: promocion.cliente_id || undefined,
      fecha_inicio: promocion.fecha_inicio,
      fecha_fin: promocion.fecha_fin || '',
      activo: promocion.activo,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Promociones y Descuentos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona promociones, descuentos y ofertas especiales para tus productos
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Lista de Promociones
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {editingPromotion ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Mostrar errores si existen */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {activeTab === 'list' ? (
              <PromotionList
                onEdit={handleEditPromotion}
                onNew={handleNewPromotion}
              />
            ) : (
              <PromotionForm
                initialData={editingPromotion ? getInitialFormData(editingPromotion) : undefined}
                onSubmit={handleSubmitPromotion}
                onCancel={handleCancelForm}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Descuento por Porcentaje
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Aplica un porcentaje de descuento sobre el precio del producto
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 font-semibold">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Descuento Fijo
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Resta una cantidad fija del precio del producto
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">2x1</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Promoción 2x1
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Compra 2 productos y lleva 1 gratis automáticamente
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">X+Y</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Compra X lleva Y
                    </dt>
                    <dd className="text-sm text-gray-900">
                      Configura promociones personalizadas de cantidad
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones de uso */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                💡 Consejos para usar promociones
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Las promociones se aplican automáticamente durante las ventas</li>
                  <li>Puedes configurar promociones por producto específico o generales</li>
                  <li>Las fechas de vigencia te permiten programar ofertas por temporada</li>
                  <li>Usa la cantidad mínima para crear promociones por volumen</li>
                  <li>Las promociones inactivas no se aplicarán en las ventas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;