/**
 * Formatea un número a pesos chilenos
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado en pesos chilenos
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea un número a pesos chilenos sin el símbolo
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado en pesos chilenos sin símbolo
 */
export const formatNumber = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}; 