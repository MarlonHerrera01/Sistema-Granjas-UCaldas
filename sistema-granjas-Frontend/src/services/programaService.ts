// src/services/programaService.ts
import type { Programa } from '../types/granjaTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Función para obtener headers con token
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

export const programaService = {
  // ========== OPERACIONES CRUD BÁSICAS ==========
  
  // OBTENER todos los programas
  async obtenerProgramas(skip: number = 0, limit: number = 100): Promise<Programa[]> {
    try {
      console.log('🔍 Obteniendo programas...');
      const response = await fetch(`${API_BASE_URL}/programas/?skip=${skip}&limit=${limit}`, {
        headers: getHeaders()
      });
      
      console.log('📊 Status programas:', response.status);
      const data = await handleResponse(response);
      console.log('✅ Programas obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo programas:', error);
      throw error;
    }
  },

  // OBTENER programa por ID
  async obtenerProgramaPorId(id: number): Promise<Programa> {
    const response = await fetch(`${API_BASE_URL}/programas/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // CREAR programa
  async crearPrograma(datosPrograma: Omit<Programa, 'id' | 'fecha_creacion'>): Promise<Programa> {
    const response = await fetch(`${API_BASE_URL}/programas/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosPrograma)
    });
    return handleResponse(response);
  },

  // ACTUALIZAR programa
  async actualizarPrograma(id: number, datosPrograma: Partial<Programa>): Promise<Programa> {
    const response = await fetch(`${API_BASE_URL}/programas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(datosPrograma)
    });
    return handleResponse(response);
  },

  // ELIMINAR programa
  async eliminarPrograma(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/programas/${id}`, {
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
export const getProgramas = programaService.obtenerProgramas;
export const getPrograma = programaService.obtenerProgramaPorId;
export const createPrograma = programaService.crearPrograma;
export const updatePrograma = programaService.actualizarPrograma;
export const deletePrograma = programaService.eliminarPrograma;

export default programaService;