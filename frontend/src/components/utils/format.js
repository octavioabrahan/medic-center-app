/**
 * Formatea un número como moneda
 * @param {number} amount - El monto a formatear
 * @param {string} currency - El código de la moneda (USD, VES)
 * @returns {string} - El monto formateado
 */
export const formatCurrency = (amount, currency = 'USD') => {
    // Validar que amount sea un número
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return '0,00';
    }
  
    // Formatear según la moneda
    switch (currency) {
      case 'USD':
        return `$${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
      
      case 'VES':
        return `Bs. ${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
      
      default:
        return `${numAmount.toFixed(2)}`;
    }
  };
  
  /**
   * Formatea una fecha a formato local
   * @param {string|Date} date - La fecha a formatear
   * @returns {string} - La fecha formateada
   */
  export const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  /**
   * Formatea una fecha y hora a formato local
   * @param {string|Date} date - La fecha a formatear
   * @returns {string} - La fecha y hora formateadas
   */
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };