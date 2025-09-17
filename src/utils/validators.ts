// src/utils/validators.ts

// Validación de email
export const isValidEmail = (email: string): boolean => {
  if (!email.trim()) return true // Opcional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Validación de stock (cantidad)
export const isValidStock = (stock: number): boolean => {
  return stock >= 0 && Number.isInteger(stock)
}

// Validación de precio
export const isValidPrice = (price: number): boolean => {
  return price > 0 && !isNaN(price) && isFinite(price)
}

// Validación de código de producto
export const isValidProductCode = (code: string): boolean => {
  if (!code.trim()) return false
  
  // Al menos 2 caracteres, solo letras, números, guiones y guiones bajos
  const codeRegex = /^[a-zA-Z0-9_-]{2,}$/
  return codeRegex.test(code.trim())
}

// Validación de nombre (general)
export const isValidName = (name: string, minLength: number = 2): boolean => {
  return name.trim().length >= minLength
}

// Validación de documento de identidad
export const isValidId = (id: string, type: string): { valid: boolean; message?: string } => {
  if (!id.trim()) return { valid: true } // Opcional
  
  const cleanId = id.trim().replace(/\D/g, '') // Solo números
  
  switch (type) {
    case 'CC': // Cédula de ciudadanía
      if (cleanId.length < 6 || cleanId.length > 10) {
        return { valid: false, message: 'La cédula debe tener entre 6 y 10 dígitos' }
      }
      break
      
    case 'TI': // Tarjeta de identidad
      if (cleanId.length < 8 || cleanId.length > 11) {
        return { valid: false, message: 'La tarjeta de identidad debe tener entre 8 y 11 dígitos' }
      }
      break
      
    case 'CE': // Cédula de extranjería
      if (cleanId.length < 6 || cleanId.length > 10) {
        return { valid: false, message: 'La cédula de extranjería debe tener entre 6 y 10 dígitos' }
      }
      break
      
    case 'NIT': // Número de identificación tributaria
      if (cleanId.length < 9 || cleanId.length > 10) {
        return { valid: false, message: 'El NIT debe tener entre 9 y 10 dígitos' }
      }
      break
      
    case 'PP': // Pasaporte
      if (id.trim().length < 6 || id.trim().length > 20) {
        return { valid: false, message: 'El pasaporte debe tener entre 6 y 20 caracteres' }
      }
      break
      
    default:
      if (id.trim().length < 6 || id.trim().length > 20) {
        return { valid: false, message: 'El documento debe tener entre 6 y 20 caracteres' }
      }
  }
  
  return { valid: true }
}

// Validación de cantidad en ventas
export const isValidSaleQuantity = (quantity: number, availableStock?: number): { valid: boolean; message?: string } => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      valid: false,
      message: 'La cantidad debe ser un número entero mayor a 0'
    }
  }
  
  if (availableStock !== undefined && quantity > availableStock) {
    return {
      valid: false,
      message: `No hay suficiente stock disponible. Stock actual: ${availableStock}`
    }
  }
  
  return { valid: true }
}

// Validación de teléfono (opcional)
export const isValidPhone = (phone: string): boolean => {
  if (!phone.trim()) return true // Opcional
  
  // Formato colombiano: +57 seguido de 10 dígitos o solo 10 dígitos
  const phoneRegex = /^(\+57\s?)?[0-9]{10}$/
  return phoneRegex.test(phone.trim().replace(/\s/g, ''))
}

// Limpiar y formatear strings
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ')
}

// Formatear documento de identidad
export const formatId = (id: string, type: string): string => {
  const cleaned = id.replace(/\D/g, '')
  
  switch (type) {
    case 'CC':
    case 'TI':
    case 'CE':
      // Formatear con puntos cada 3 dígitos
      return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    case 'NIT':
      // Formatear NIT con guión antes del último dígito
      if (cleaned.length >= 2) {
        return cleaned.slice(0, -1) + '-' + cleaned.slice(-1)
      }
      return cleaned
    default:
      return id.trim()
  }
}