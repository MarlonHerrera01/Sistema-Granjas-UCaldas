/* eslint-disable @typescript-eslint/no-explicit-any */

// src/api/auth.ts

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const AUTH_URL = `${API_URL}/auth`;



export interface LoginResponse {

  access_token: string;

  token_type: string;

  nombre: string;

  rol: string;

  rol_id: number;

  email: string;

  message?: string;

}



export interface RegisterResponse extends LoginResponse {

  message?: string;

}



export interface Role {

  id: number;

  nombre: string;

  descripcion: string;

}



export interface RolesResponse {

  roles: Role[];

}



export interface LogoutResponse {

  message: string;

  detail: string;

}



export interface VerifyTokenResponse {

  valid: boolean;

  user: {

    email: string;

    rol: string;

    rol_id: number;

    nombre: string;

  };

}



// === LOGIN TRADICIONAL ===

export async function login(email: string, password: string): Promise<LoginResponse> {

  try {

    const response = await fetch(`${AUTH_URL}/login`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Accept": "application/json"

      },

      body: JSON.stringify({ email, password }),

    });



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({

        detail: "Error de conexión con el servidor"

      }));

      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);

    }



    return await response.json();

  } catch (error: any) {

    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");

    }

    throw error;

  }

}



// === REGISTRO TRADICIONAL ===

export async function register(nombre: string, email: string, password: string, rol_id: number): Promise<RegisterResponse> {

  try {

    const response = await fetch(`${AUTH_URL}/register`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Accept": "application/json"

      },

      body: JSON.stringify({ nombre, email, password, rol_id }),

    });



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({

        detail: "Error de conexión con el servidor"

      }));

      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);

    }



    return await response.json();

  } catch (error: any) {

    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");

    }

    throw error;

  }

}



// === OBTENER ROLES DISPONIBLES ===

export async function getRolesDisponibles(): Promise<RolesResponse> {

  try {

    const response = await fetch(`${AUTH_URL}/roles-disponibles`, {

      headers: {

        "Accept": "application/json"

      }

    });



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({

        detail: "Error al obtener roles"

      }));

      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);

    }



    return await response.json();

  } catch (error: any) {

    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      // Retornar roles por defecto si el backend no está disponible

      console.warn("Backend no disponible, usando roles por defecto");

      return {

        roles: [

          { id: 2, nombre: "Docente/Asesor", descripcion: "Personal académico" },

          { id: 3, nombre: "Talento Humano", descripcion: "Gestión de personal" },

          { id: 4, nombre: "Trabajador", descripcion: "Personal operativo" }

        ]

      };

    }

    throw error;

  }

}



// === LOGIN CON GOOGLE ===

export async function loginWithGoogle(token: string): Promise<LoginResponse> {

  try {

    const response = await fetch(`${AUTH_URL}/google/login`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Accept": "application/json"

      },

      body: JSON.stringify({ token }),

    });



    if (!response.ok) {

      const errorData = await response.json().catch(() => ({

        detail: "Error de conexión con el servidor"

      }));

      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);

    }



    return await response.json();

  } catch (error: any) {

    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");

    }

    throw error;

  }

}



// === LOGOUT ===

export async function logout(): Promise<LogoutResponse> {

  const token = getToken();

 

  try {

    const response = await fetch(`${AUTH_URL}/logout`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        ...(token && { "Authorization": `Bearer ${token}` })

      },

      ...(token && { body: JSON.stringify({ token }) })

    });

   

    if (!response.ok) {

      console.warn("Error en logout del backend, pero limpiando frontend igual");

    }

  } catch (error) {

    console.warn("Error conectando al backend, pero limpiando frontend igual", error);

  } finally {

    // Siempre limpiar el frontend

    clearAuthData();

  }

 

  return {

    message: "Logout exitoso",

    detail: "Sesión cerrada correctamente."

  };

}



// === VERIFICAR TOKEN ===

export async function verifyToken(token: string): Promise<VerifyTokenResponse> {

  try {

    const response = await fetch(`${AUTH_URL}/verify?token=${encodeURIComponent(token)}`);

   

    if (!response.ok) {

      throw new Error("Token inválido");

    }

   

    return await response.json();

  } catch (error: any) {

    if (error.name === 'TypeError' && error.message.includes('fetch')) {

      throw new Error("No se pudo verificar el token. Error de conexión.");

    }

    throw error;

  }

}



// === SIMULACIÓN DE LOGIN (PARA PRUEBAS) ===

export function simulateLogin(email: string): LoginResponse {

  const simulatedToken = btoa(JSON.stringify({

    sub: email,

    rol: "Trabajador",

    rol_id: 4,

    nombre: email.split('@')[0],

    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas

  }));



  return {

    access_token: simulatedToken,

    token_type: "bearer",

    nombre: email.split('@')[0],

    rol: "Trabajador",

    rol_id: 4,

    email: email,

    message: "Login simulado exitoso"

  };

}



// === UTILIDAD: GUARDAR TOKEN ===

export function saveToken(token: string): void {

  localStorage.setItem("token", token);

}



// === UTILIDAD: OBTENER TOKEN ===

export function getToken(): string | null {

  return localStorage.getItem("token");

}



// === UTILIDAD: ELIMINAR TOKEN (LOGOUT) ===

export function clearAuthData(): void {

  localStorage.removeItem("token");

  localStorage.removeItem("user");

  localStorage.removeItem("user_role");

  sessionStorage.removeItem("token");

}



// === VERIFICAR SI ESTÁ AUTENTICADO ===

export function isAuthenticated(): boolean {

  const token = getToken();

  if (!token) return false;

 

  // Verificar expiración del token

  try {

    const payload = JSON.parse(atob(token.split('.')[1]));

    const exp = payload.exp;

   

    // Si es un token simulado, usar la fecha directamente

    if (typeof exp === 'number') {

      return Date.now() < exp;

    }

   

    // Si es un token JWT real, convertir de segundos a milisegundos

    return Date.now() < exp * 1000;

  } catch {

    return false;

  }

}



// === OBTENER DATOS DEL USUARIO DEL TOKEN ===

export function getUserData(): { nombre: string; rol: string; email: string; rol_id: number } | null {

  const token = getToken();

  if (!token) return null;

 

  try {

    const payload = JSON.parse(atob(token.split('.')[1]));

    return {

      nombre: payload.nombre || payload.sub?.split('@')[0] || 'Usuario',

      rol: payload.rol || 'Trabajador',

      email: payload.sub || payload.email || '',

      rol_id: payload.rol_id || 4

    };

  } catch {

    return null;

  }

}



// === VERIFICAR SI EL USUARIO TIENE UN ROL ESPECÍFICO ===

export function hasRole(requiredRole: string): boolean {

  const userData = getUserData();

  return userData?.rol === requiredRole;

}



// === VERIFICAR SI EL USUARIO TIENE ALGUNO DE LOS ROLES ===

export function hasAnyRole(requiredRoles: string[]): boolean {

  const userData = getUserData();

  return requiredRoles.includes(userData?.rol || '');

}



// === OBTENER TODOS LOS DATOS DE AUTH ===

export function getAuthData(): {

  isAuthenticated: boolean;

  user: { nombre: string; rol: string; email: string; rol_id: number } | null;

  token: string | null;

} {

  return {

    isAuthenticated: isAuthenticated(),

    user: getUserData(),

    token: getToken()

  };

}



// === VERIFICAR CONEXIÓN CON BACKEND ===

export async function checkBackendConnection(): Promise<boolean> {

  try {

    const response = await fetch(`${API_URL}/health`, {

      method: 'GET',

      headers: { 'Accept': 'application/json' }

    });

    return response.ok;

  } catch {

    return false;

  }

}