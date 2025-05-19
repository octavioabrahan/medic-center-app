// Este script está diseñado para pegar en la consola del navegador
// o llamarse desde la consola JS en la aplicación.

(function() {
  console.log('=== Comenzando limpieza de autenticación ===');
  
  // Estado inicial
  console.log('Estado inicial:');
  console.log('- authToken existe:', localStorage.getItem('authToken') ? 'Sí' : 'No');
  console.log('- user existe:', localStorage.getItem('user') ? 'Sí' : 'No');
  
  // Eliminar datos de autenticación
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Verificar que se eliminaron
  console.log('\nEstado después de limpieza:');
  console.log('- authToken existe:', localStorage.getItem('authToken') ? 'Sí' : 'No');
  console.log('- user existe:', localStorage.getItem('user') ? 'Sí' : 'No');
  
  console.log('\n✅ Autenticación eliminada correctamente');
  console.log('Para redirigir a login, ejecute:');
  console.log('window.location.href = "/login";');
  
  return {
    redirectToLogin: function() {
      window.location.href = '/login';
    },
    
    redirectToAdmin: function() {
      window.location.href = '/admin';
    },
    
    redirectToAuthTool: function() {
      window.location.href = '/auth-tool.html';
    }
  };
})();
