// src/components/products/ProductSearch.tsx
import React, { useState, useEffect, useCallback } from 'react'

interface ProductSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  showFilters?: boolean
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  placeholder = "Buscar productos por código o nombre...",
  className = "",
  debounceMs = 300,
  showFilters = false
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'code' | 'name'>('all')

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch, debounceMs])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch()
    }
  }, [clearSearch])

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={`h-5 w-5 transition-colors duration-200 ${
                isFocused ? 'text-blue-500' : 'text-gray-400'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`block w-full pl-10 pr-10 py-3 border rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 ${
              isFocused ? 'border-blue-300 shadow-lg' : 'border-gray-300 shadow-sm'
            }`}
            placeholder={placeholder}
          />
          
          {query && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                title="Limpiar búsqueda (Esc)"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Search Filters (Optional) */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-gray-500 flex items-center">
              Buscar en:
            </span>
            
            {(['all', 'code', 'name'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                  searchType === type
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {type === 'all' && '🔍 Todo'}
                {type === 'code' && '🏷️ Código'}
                {type === 'name' && '📝 Nombre'}
              </button>
            ))}
          </div>
        )}

        {/* Search Results Info */}
        {query && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Buscando: "{query}"
              {showFilters && searchType !== 'all' && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  {searchType === 'code' ? 'en códigos' : 'en nombres'}
                </span>
              )}
            </span>
            
            <span className="text-gray-400">
              Presiona Esc para limpiar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSearch