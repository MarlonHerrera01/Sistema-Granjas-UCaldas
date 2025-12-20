// src/services/recomendacionService.ts
import type { 
  Recomendacion, 
  CreateRecomendacionDto, 
  UpdateRecomendacionDto,
  EstadisticasRecomendaciones,
  RecomendacionFilters,
  Evidencia
} from '../types/recomendacionTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Headers con token
const getHeaders = (multipart = false): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  
  if (!multipart) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
};

// Manejo de errores
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};

// Servicio general
export const recomendacionService = {

  // ===================== CRUD =====================

  async obtenerRecomendaciones(filtros?: RecomendacionFilters): Promise<Recomendacion[]> {
    const params = new URLSearchParams();
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/recomendaciones${params.toString() ? `?${params}` : ''}`;
    
    const response = await fetch(url, { headers: getHeaders() });    
    return handleResponse(response);
  },

  async obtenerRecomendacionPorId(id: number): Promise<Recomendacion> {
    const response = await fetch(`${API_BASE_URL}/recomendaciones/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async crearRecomendacion(datos: CreateRecomendacionDto, user: any): Promise<Recomendacion> {
    try {
      // 1. Primero crear la recomendación
      const response = await fetch(`${API_BASE_URL}/recomendaciones/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} creando recomendación`);
      }

      const recomendacionCreada: Recomendacion = await response.json();

      // 2. Si hay evidencias iniciales, subirlas y crear registros de evidencias
      if (datos.evidencias?.length) {
        await Promise.all(
          datos.evidencias.map(async (ev: any) => {
            try {
              // Subir archivo
              const formData = new FormData();
              formData.append('file', ev.file);

              const uploadRes = await fetch(`${API_BASE_URL}/files/upload`, {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: formData
              });

              if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error(`❌ Error subiendo archivo ${ev.file.name}:`, errorText);
                throw new Error(`Error subiendo archivo ${ev.file.name}`);
              }

              const fileData = await uploadRes.json();

              // Crear registro de evidencia
              const evidenciaPayload = {
                tipo: ev.tipo || 'imagen',
                descripcion: ev.descripcion || `Evidencia para recomendación ${recomendacionCreada.id}`,
                url_archivo: fileData.url || fileData.filename || fileData.file_url,
                tipo_entidad: 'recomendacion',
                entidad_id: recomendacionCreada.id,
                usuario_id: user.id || 1
              };

              const evidenciaRes = await fetch(`${API_BASE_URL}/evidencias/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(evidenciaPayload)
              });

              if (!evidenciaRes.ok) {
                const errorData = await evidenciaRes.json().catch(() => ({}));
                console.error(`❌ Error creando evidencia:`, errorData);
                throw new Error(`Error creando registro de evidencia`);
              }

              const evidenciaCreada = await evidenciaRes.json();
              console.log('✅ Evidencia creada:', evidenciaCreada);

              return evidenciaCreada;
            } catch (error) {
              console.error(`❌ Error procesando evidencia:`, error);
              return null;
            }
          })
        );
        
        console.log('✅ Todas las evidencias procesadas');
      }

      return recomendacionCreada;

    } catch (error) {
      console.error('❌ Error en crearRecomendacion:', error);
      throw error;
    }
  },

  async actualizarRecomendacion(id: number, datos: UpdateRecomendacionDto, user: any): Promise<Recomendacion> {
    try {
      // 1. Actualizar recomendación
      const response = await fetch(`${API_BASE_URL}/recomendaciones/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Error ${response.status} actualizando recomendación`
        );
      }

      const recomendacionActualizada: Recomendacion = await response.json();

      // 2. Procesar evidencias nuevas si vienen
      if (datos.evidencias?.length) {
        await Promise.all(
          datos.evidencias.map(async (ev: any) => {
            try {
              // Subir archivo
              const formData = new FormData();
              formData.append("file", ev.file);

              const uploadRes = await fetch(`${API_BASE_URL}/files/upload`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
              });

              if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error(`ACTUALIZACION Error subiendo archivo ${ev.file.name}:`, errorText);
                throw new Error(`Error subiendo archivo ${ev.file.name}`);
              }

              const fileData = await uploadRes.json();

              // Crear registro de evidencia
              const evidenciaPayload = {
                tipo: ev.tipo || "imagen",
                descripcion:
                  ev.descripcion ||
                  `Evidencia actualizada para recomendación ${recomendacionActualizada.id}`,
                url_archivo:
                  fileData.url || fileData.filename || fileData.file_url,
                tipo_entidad: "recomendacion",
                entidad_id: recomendacionActualizada.id,
                usuario_id: user.id || 1,
              };

              const evidenciaRes = await fetch(`${API_BASE_URL}/evidencias/`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(evidenciaPayload),
              });

              if (!evidenciaRes.ok) {
                const errorData = await evidenciaRes.json().catch(() => ({}));
                console.error(`❌ Error creando evidencia:`, errorData);
                throw new Error("Error creando registro de evidencia");
              }

              const evidenciaCreada = await evidenciaRes.json();
              console.log("✅ Evidencia creada (actualización):", evidenciaCreada);

              return evidenciaCreada;
            } catch (error) {
              console.error("❌ Error procesando evidencia:", error);
              return null;
            }
          })
        );

        console.log("✅ Todas las evidencias procesadas en actualización");
      }

      return recomendacionActualizada;
    } catch (error) {
      console.error("❌ Error en actualizarRecomendacion:", error);
      throw error;
    }
  },

  // NUEVO MÉTODO: Eliminar recomendación
  async eliminarRecomendacion(id: number): Promise<void> {
    try {
      console.log(`🗑️ Intentando eliminar recomendación ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/recomendaciones/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`;
        
        console.error(`❌ Error eliminando recomendación ID ${id}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Verificar si la respuesta tiene contenido
      const responseText = await response.text();
      
      // Si hay contenido, intentar parsearlo como JSON
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Recomendación eliminada correctamente:', data);
        } catch {
          console.log('✅ Recomendación eliminada correctamente');
        }
      } else {
        console.log('✅ Recomendación eliminada correctamente (sin contenido en respuesta)');
      }
      
      return;
    } catch (error) {
      console.error(`❌ Error en eliminarRecomendacion para ID ${id}:`, error);
      throw error;
    }
  },

  async aprobarRecomendacion(id: number, observaciones?: string): Promise<Recomendacion> {
    const payload = {
      aprobar: true,
      observaciones: observaciones || ""  // Si no hay observaciones, envía string vacío
    };

    const response = await fetch(`${API_BASE_URL}/recomendaciones/${id}/aprobar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  async obtenerEstadisticas(): Promise<EstadisticasRecomendaciones> {
    const response = await fetch(`${API_BASE_URL}/recomendaciones/estadisticas/resumen`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async obtenerEvidencias(recomendacionId: number): Promise<Evidencia[]> {
    try {
      console.log(`📂 Obteniendo evidencias para recomendación ID: ${recomendacionId}`);
      
      // Usa el endpoint específico para evidencias de recomendación
      const response = await fetch(`${API_BASE_URL}/evidencias/recomendacion/${recomendacionId}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error HTTP ${response.status}:`, errorText);
        throw new Error(`Error ${response.status} obteniendo evidencias`);
      }

      const data = await response.json();
      console.log('📄 Respuesta de evidencias:', data);
      
      // Asegúrate de devolver un array
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.items)) {
        return data.items;
      } else if (data && Array.isArray(data.evidencias)) {
        return data.evidencias;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado para evidencias:', data);
        return [];
      }

    } catch (e) {
      console.error("❌ Error en obtenerEvidencias:", e);
      return [];
    }
  },

  async eliminarEvidencia(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/evidencias/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  },

  // ===================== AUXILIARES =====================

  async obtenerTiposRecomendacion(): Promise<string[]> {
    return ['riego', 'fertilizacion', 'poda', 'cosecha', 'proteccion', 'otro'];
  },

  async obtenerEstadosRecomendacion(): Promise<string[]> {
    return ['pendiente', 'aprobada', 'rechazada', 'en_ejecucion', 'completada', 'cancelada'];
  }
};

// Aliases
export const getRecomendaciones = recomendacionService.obtenerRecomendaciones;
export const getRecomendacionById = recomendacionService.obtenerRecomendacionPorId;
export const createRecomendacion = recomendacionService.crearRecomendacion;
export const updateRecomendacion = recomendacionService.actualizarRecomendacion;
export const deleteRecomendacion = recomendacionService.eliminarRecomendacion;
export const approveRecomendacion = recomendacionService.aprobarRecomendacion;
export const rejectRecomendacion = recomendacionService.rechazarRecomendacion;
export const getRecomendacionStats = recomendacionService.obtenerEstadisticas;

export default recomendacionService;