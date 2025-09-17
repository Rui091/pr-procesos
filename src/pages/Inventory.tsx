// src/pages/Inventory.tsx
import React from 'react'
import { InventoryView } from '../components/inventory'

const InventoryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Inventario</h1>
          <p className="mt-2 text-sm text-gray-700">
            Control y gestión del inventario de productos
          </p>
        </div>
      </div>

      <InventoryView />
    </div>
  )
}

export default InventoryPage
