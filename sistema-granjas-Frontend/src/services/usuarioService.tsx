// src/services/usuarioService.ts
import type { Usuario } from '../types/granjaTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Función para obtener headers con token
const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');

    console.log('🔑 DEBUG Token en localStorage:', token);
    console.log('🔑 DEBUG Token length:', token?.length);
    console.log('🔑 DEBUG Token primeros 20 chars:', token?.substring(0, 20));

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 DEBUG Headers completos:', headers);
    } else {
        console.warn('⚠️ DEBUG: No hay token en localStorage');
    }

    return headers;
};

// Función para manejar errores de respuesta
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `Error ${response.status}: ${response.statusText}`
        );
    }
    return response.json();
};

export const usuarioService = {
    // ========== OPERACIONES CRUD BÁSICAS ==========

    // OBTENER todos los usuarios
    async obtenerUsuarios(skip: number = 0, limit: number = 100): Promise<Usuario[]> {
        try {
            console.log('🔍 DEBUG Iniciando obtenerUsuarios...');
            const url = `${API_BASE_URL}/usuarios/?skip=${skip}&limit=${limit}`;
            console.log('📤 DEBUG URL completa:', url);

            const headers = getHeaders();
            console.log('📋 DEBUG Headers a enviar:', headers);

            const response = await fetch(url, {
                headers: headers,
                credentials: 'include' // Añadir esto temporalmente
            });

            console.log('📊 DEBUG Response status:', response.status);
            console.log('📊 DEBUG Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ DEBUG Error response body:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ DEBUG Usuarios obtenidos:', data);
            return data;
        } catch (error) {
            console.error('❌ DEBUG Error completo obteniendo usuarios:', error);
            throw error;
        }
    },

    // OBTENER usuario por ID
    async obtenerUsuarioPorId(id: number): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // CREAR usuario
    async crearUsuario(datosUsuario: Omit<Usuario, 'id' | 'fecha_creacion'>): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(datosUsuario)
        });
        return handleResponse(response);
    },

    // ACTUALIZAR usuario
    async actualizarUsuario(id: number, datosUsuario: Partial<Usuario>): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(datosUsuario)
        });
        return handleResponse(response);
    },

    // ELIMINAR usuario
    async eliminarUsuario(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
    }
};

// ========== ALIAS PARA MANTENER COMPATIBILIDAD ==========

// Alias para las funciones existentes
export const getUsuarios = usuarioService.obtenerUsuarios;
export const getUsuario = usuarioService.obtenerUsuarioPorId;
export const createUsuario = usuarioService.crearUsuario;
export const updateUsuario = usuarioService.actualizarUsuario;
export const deleteUsuario = usuarioService.eliminarUsuario;

export default usuarioService;