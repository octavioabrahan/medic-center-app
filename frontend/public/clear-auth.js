// Este script elimina cualquier información de autenticación
// y redirige al usuario a la página de login

// Limpiar localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('user');

// Registrar la limpieza
console.log('✅ Se ha eliminado la información de autenticación');

// Redirigir a la página de login
window.location.href = '/login';
