// Este script tiene la finalidad de limpiar manualmente el localStorage
// para simular un usuario no autenticado y probar la redirección al login

// Limpiar localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('user');

console.log('localStorage limpiado. El usuario ahora debería ser redirigido al login.');
