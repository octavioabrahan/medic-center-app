# Authentication System Documentation

## Overview

This document provides a comprehensive explanation of the authentication system implemented in the Medical Center Application. The system handles user authentication, route protection, and permission management for both admin and regular users.

## Key Components

### Frontend Authentication Files

| File | Description |
|------|-------------|
| `/src/components/auth/Login.js` | Main login component with form UI, handles authentication requests and redirects |
| `/src/components/auth/Auth.css` | Styling for authentication-related components |
| `/src/components/auth/AdminAuthRedirector.js` | Global guard for admin routes that redirects unauthenticated users to login |
| `/src/api.js` | Contains the `auth` object with methods for login, logout, token validation, etc. |
| `/src/context/AuthContext.js` | Provides global state management for authentication status |
| `/src/components/debug/AuthDebugger.js` | Tool for testing and debugging authentication functionality |
| `/public/auth-tool.html` | Client-side testing tool for authentication |
| `/public/logout.js` | Utility script for client-side logout functionality |

### Backend Authentication Files

| File | Description |
|------|-------------|
| `/backend/middleware/auth.js` | Middleware that validates JWT tokens and handles user authentication |
| `/backend/middleware/security.js` | Implements security features like rate limiting and request validation |
| `/backend/middleware/screenPermission.js` | Checks user permissions for specific screens/operations |
| `/backend/utils/encryption.js` | Handles encryption/decryption of sensitive data |
| `/backend/utils/passwordUtils.js` | Functions for password hashing, validation, and reset functionality |

## Authentication Flow

### Login Process

1. User enters credentials in the `Login` component
2. Frontend sends credentials to backend via `auth.login()` method in `api.js`
3. Backend validates credentials and issues a JWT token
4. Token is stored in localStorage along with user information
5. User is redirected to the appropriate page based on their role

### Token Validation

1. The `isAuthenticated()` method in `api.js` checks:
   - If a token exists in localStorage
   - If the token has a valid structure
   - If the token has not expired (by decoding and checking expiration)

2. Protected routes use this method to verify authentication status

### Route Protection

1. `AdminAuthRedirector.js` monitors navigation and intercepts attempts to access admin routes
2. Unauthenticated users are redirected to the login page with a redirect parameter
3. After successful login, users are redirected to their originally requested page

### Permissions Handling

1. User roles are stored in the JWT token payload
2. The backend `screenPermission.js` middleware validates if a user has permission for specific actions
3. The frontend can use the decoded token information to conditionally render UI elements

## Debugging Tools

- `AuthDebugger.js`: A component that displays current authentication state, with options to simulate login/logout
- `auth-tool.html`: A standalone page for testing authentication flows
- Browser console logging is implemented throughout the authentication flow for troubleshooting

## Important Security Considerations

1. Tokens are stored in localStorage which provides persistence but is vulnerable to XSS attacks
2. Token validation includes expiration checking to limit the usable lifetime of a compromised token
3. Sensitive operations require re-authentication or additional verification
4. Failed login attempts are rate-limited to prevent brute force attacks
5. Passwords are hashed using secure algorithms in the backend

## Common Authentication Issues

- **"Not authenticated" errors**: Usually due to expired tokens; solution is to logout and login again
- **Redirect loops**: Can happen if route protection logic has bugs; check the redirection conditions
- **Permission denied**: User may not have the required role for the requested operation
- **"Invalid token" errors**: Token may be corrupted or tampered with; requires a fresh login
