// src/components/Recomendaciones/DetallesRecomendacionModal.tsx
import React, { useState, useEffect } from 'react';
import type { Recomendacion, Evidencia } from '../../types/recomendacionTypes';
import Modal from '../Common/Modal';
import recomendacionService from '../../services/recomendacionService';
import loteService from '../../services/loteService'; // Importar servicio de lotes
import granjaService from '../../services/granjaService'; // Importar servicio de granjas
import diagnosticoService from '../../services/diagnosticoService'; // Importar servicio de diagnósticos

interface DetallesRecomendacionModalProps {
    isOpen: boolean;
    recomendacion: Recomendacion | null;
    onClose: () => void;
}

// Interfaces para datos adicionales
interface LoteInfo {
    id: number;
    nombre: string;
    granja_id: number;
    granja_nombre?: string;
    cultivo_id?: number;
    cultivo_nombre?: string;
    [key: string]: any;
}

interface GranjaInfo {
    id: number;
    nombre: string;
    ubicacion?: string;
    descripcion?: string;
    [key: string]: any;
}

interface DiagnosticoInfo {
    id: number;
    tipo: string;
    descripcion?: string;
    estado?: string;
    [key: string]: any;
}

const DetallesRecomendacionModal: React.FC<DetallesRecomendacionModalProps> = ({
    isOpen,
    recomendacion,
    onClose
}) => {
    // Hooks al inicio siempre
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [loadingEvidencias, setLoadingEvidencias] = useState(false);
    const [loadingDetalles, setLoadingDetalles] = useState(false);
    const [recomendacionDetallada, setRecomendacionDetallada] = useState<Recomendacion | null>(null);

    // Estados para datos adicionales
    const [loteInfo, setLoteInfo] = useState<LoteInfo | null>(null);
    const [granjaInfo, setGranjaInfo] = useState<GranjaInfo | null>(null);
    const [diagnosticoInfo, setDiagnosticoInfo] = useState<DiagnosticoInfo | null>(null);
    const [loadingExtra, setLoadingExtra] = useState(false);

    useEffect(() => {
        if (isOpen && recomendacion) {
            setRecomendacionDetallada(null);
            setLoteInfo(null);
            setGranjaInfo(null);
            setDiagnosticoInfo(null);

            cargarDetallesCompletos(recomendacion.id);
            cargarEvidencias(recomendacion.id);
            cargarInformacionAdicional(recomendacion);
        }
    }, [isOpen, recomendacion]);

    const cargarDetallesCompletos = async (id: number) => {
        console.log('🔍 Cargando detalles completos para la recomendación ID:', id);
        try {
            setLoadingDetalles(true);
            const detalles = await recomendacionService.obtenerRecomendacionPorId(id);
            setRecomendacionDetallada(detalles);
        } catch (err) {
            console.error('Error cargando detalles:', err);
        } finally {
            setLoadingDetalles(false);
        }
    };

    const cargarEvidencias = async (id: number) => {
        try {
            setLoadingEvidencias(true);
            const data = await recomendacionService.obtenerEvidencias(id);
            const evidenciasData = Array.isArray(data) ? data : (data?.items || []);
            setEvidencias(evidenciasData);
        } catch (err) {
            console.error('Error cargando evidencias:', err);
            setEvidencias([]);
        } finally {
            setLoadingEvidencias(false);
        }
    };

    const cargarInformacionAdicional = async (recomendacion: Recomendacion) => {
        console.log('🔍 Iniciando carga de información adicional para la recomendación:', recomendacion);
        try {
            setLoadingExtra(true);
            console.log('🔍 Cargando información adicional para la recomendación:', recomendacion);

            // 1. Cargar información del lote
            if (recomendacion.lote_id) {
                try {
                    const lote = await loteService.obtenerLote(recomendacion.lote_id);
                    console.log('Marlon  Información del lote:', lote);
                    setLoteInfo(lote);

                    // 2. Si el lote tiene granja_id, cargar información de la granja
                    if (lote.granja_id) {
                        try {
                            const granja = await granjaService.obtenerGranjaPorId(lote.granja_id);
                            console.log('📊 Información de la granja:', granja);
                            setGranjaInfo(granja);
                        } catch (granjaError) {
                            console.error('Error cargando granja:', granjaError);
                        }
                    }

                    // 3. Si el lote tiene cultivo_id, podemos cargar info del cultivo si quieres
                    // (opcional, depende de tus necesidades)

                } catch (loteError) {
                    console.error('Error cargando lote:', loteError);
                }
            }

            // 4. Cargar información del diagnóstico si existe
            if (recomendacion.diagnostico_id) {
                try {
                    const diagnostico = await diagnosticoService.obtenerDiagnosticoPorId(recomendacion.diagnostico_id);
                    console.log('📊 Información del diagnóstico:', diagnostico);
                    setDiagnosticoInfo(diagnostico);
                } catch (diagnosticoError) {
                    console.error('Error cargando diagnóstico:', diagnosticoError);
                }
            }

        } catch (err) {
            console.error('Error cargando información adicional:', err);
        } finally {
            setLoadingExtra(false);
        }
    };

    // Verificación de si debe renderizar
    if (!isOpen || !recomendacion) return null;

    const getEstadoBadge = (estado: string) => {
        const estados: Record<string, { color: string; icon: string }> = {
            pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: 'fas fa-clock' },
            aprobada: { color: 'bg-green-100 text-green-800', icon: 'fas fa-check-circle' },
            rechazada: { color: 'bg-red-100 text-red-800', icon: 'fas fa-times-circle' },
            en_ejecucion: { color: 'bg-blue-100 text-blue-800', icon: 'fas fa-spinner' },
            completada: { color: 'bg-purple-100 text-purple-800', icon: 'fas fa-flag-checkered' }
        };

        const config = estados[estado] || { color: 'bg-gray-100 text-gray-800', icon: 'fas fa-question-circle' };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <i className={`${config.icon} mr-2`}></i>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </span>
        );
    };

    const getTipoIcon = (tipo: string) => {
        const icons: Record<string, string> = {
            imagen: 'fas fa-image text-blue-500',
            video: 'fas fa-video text-red-500',
            documento: 'fas fa-file-alt text-green-500',
            audio: 'fas fa-volume-up text-purple-500',
            otro: 'fas fa-file text-gray-500'
        };
        return icons[tipo] || 'fas fa-file text-gray-500';
    };

    const getEstadoDiagnosticoBadge = (estado?: string) => {
        if (!estado) return null;

        const estados: Record<string, string> = {
            abierto: 'bg-blue-100 text-blue-800',
            en_revision: 'bg-yellow-100 text-yellow-800',
            cerrado: 'bg-green-100 text-green-800',
            pendiente: 'bg-gray-100 text-gray-800'
        };

        const color = estados[estado] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${color}`}>
                {estado}
            </span>
        );
    };

    const data = recomendacionDetallada || recomendacion;
    console.log('🔍 Detalles de la recomendación:', data, granjaInfo, loteInfo, diagnosticoInfo);

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="max-w-4xl">
            <div className="p-6 max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Recomendación #{data.id}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            {getEstadoBadge(data.estado)}
                            <span className="text-gray-600">
                                <i className="fas fa-tag mr-1"></i>
                                {data.tipo}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {loadingDetalles || loadingExtra ? (
                    <div className="text-center py-8">
                        <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                        <p className="mt-2 text-gray-600">Cargando detalles...</p>
                        {loadingExtra && (
                            <p className="text-sm text-gray-500 mt-1">
                                Obteniendo información adicional...
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* INFO GENERAL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* Col 1 */}
                            <div className="space-y-4">
                                {/* Info */}
                                <div className="bg-white border rounded-lg p-5 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                                        <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                                        Información de la Recomendación
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="font-medium text-gray-700 w-40">Título:</span>
                                            <span className="font-semibold">{data.titulo}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="font-medium text-gray-700 w-40">Tipo:</span>
                                            <span>{data.tipo}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="font-medium text-gray-700 w-40">Fecha creación:</span>
                                            <span>{new Date(data.fecha_creacion).toLocaleString()}</span>
                                        </div>
                                        {data.fecha_aprobacion && (
                                            <div className="flex">
                                                <span className="font-medium text-gray-700 w-40">Fecha aprobación:</span>
                                                <span>{new Date(data.fecha_aprobacion).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="bg-white border rounded-lg p-5 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                                        <i className="fas fa-file-alt mr-2 text-green-500"></i>
                                        Descripción
                                    </h3>
                                    <div className="bg-gray-50 rounded p-4">
                                        <p className="whitespace-pre-line text-gray-700">{data.descripcion}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-4">

                                {/* Contexto - MEJORADO */}
                                <div className="bg-white border rounded-lg p-5 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                                        <i className="fas fa-link mr-2 text-purple-500"></i>
                                        Contexto y Relaciones
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Lote */}
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <i className="fas fa-th-large text-gray-500 mr-2"></i>
                                                <span className="font-medium text-gray-700">Lote:</span>
                                            </div>
                                            {loteInfo ? (
                                                <div className="ml-6 pl-2 border-l-2 border-gray-200">
                                                    <p className="font-semibold">{loteInfo.nombre}</p>
                                                    {loteInfo.cultivo_nombre && (
                                                        <p className="text-sm text-gray-600">
                                                            Cultivo: {loteInfo.cultivo_nombre}
                                                        </p>
                                                    )}
                                                    {loteInfo.tipo_gestion && (
                                                        <p className="text-sm text-gray-600">
                                                            Gestión: {loteInfo.tipo_gestion}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="ml-6 text-gray-500">
                                                    {data.lote_nombre || `Lote ${data.lote_id}`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Granja */}
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <i className="fas fa-tractor text-gray-500 mr-2"></i>
                                                <span className="font-medium text-gray-700">Granja:</span>
                                            </div>
                                            {granjaInfo ? (
                                                <div className="ml-6 pl-2 border-l-2 border-gray-200">
                                                    <p className="font-semibold">{granjaInfo.nombre}</p>
                                                    {granjaInfo.ubicacion && (
                                                        <p className="text-sm text-gray-600">
                                                            Ubicación: {granjaInfo.ubicacion}
                                                        </p>
                                                    )}
                                                    {granjaInfo.descripcion && (
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {granjaInfo.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : loteInfo?.granja_id ? (
                                                <p className="ml-6 text-gray-500">
                                                    Granja ID: {loteInfo.granja_id}
                                                </p>
                                            ) : (
                                                <p className="ml-6 text-gray-500">
                                                    {data.granja_nombre || `Granja no asignada`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Docente */}
                                        <div className="flex items-center">
                                            <i className="fas fa-chalkboard-teacher text-gray-500 mr-2"></i>
                                            <span className="font-medium text-gray-700 mr-2">Docente:</span>
                                            <span>{data.docente_nombre || 'Sin asignar'}</span>
                                        </div>

                                        {/* Diagnóstico */}
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <i className="fas fa-stethoscope text-gray-500 mr-2"></i>
                                                <span className="font-medium text-gray-700">Diagnóstico asociado:</span>
                                            </div>
                                            {diagnosticoInfo ? (
                                                <div className="ml-6 pl-2 border-l-2 border-blue-200 bg-blue-50 rounded-r p-2">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold">
                                                            #{diagnosticoInfo.id} - {diagnosticoInfo.tipo}
                                                        </span>
                                                        {getEstadoDiagnosticoBadge(diagnosticoInfo.estado)}
                                                    </div>
                                                    {diagnosticoInfo.descripcion && (
                                                        <p className="text-sm text-gray-600 mt-1 truncate">
                                                            {diagnosticoInfo.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : data.diagnostico_id ? (
                                                <div className="ml-6">
                                                    <p className="text-gray-600">
                                                        Tiene diagnóstico asociado: <span className="font-semibold">#{data.diagnostico_id}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        (No se pudo cargar información detallada)
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="ml-6 text-gray-500 italic">
                                                    No tiene diagnóstico asociado
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Estado y acciones */}
                                <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                                        <i className="fas fa-chart-line mr-2 text-blue-500"></i>
                                        Estado y Seguimiento
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Estado actual:</span>
                                            {getEstadoBadge(data.estado)}
                                        </div>
                                        {data.labores_count !== undefined && (
                                            <div className="flex items-center">
                                                <i className="fas fa-tasks text-blue-500 mr-2"></i>
                                                <span>Labores asociadas: {data.labores_count}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                                            <span>Fecha creación: {new Date(data.fecha_creacion).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* EVIDENCIAS */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-xl text-gray-800 flex items-center">
                                    <i className="fas fa-folder-open mr-2 text-blue-500"></i>
                                    Evidencias
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {evidencias.length} archivo{evidencias.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {loadingEvidencias ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
                                    Cargando evidencias...
                                </div>
                            ) : evidencias.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded">
                                    <i className="fas fa-image text-3xl text-gray-300 mb-2"></i>
                                    <p className="text-gray-500">No hay evidencias registradas</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {evidencias.map((e) => (
                                        <div key={e.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                                            <div className="p-3 bg-gray-50 border-b">
                                                <div className="flex items-center">
                                                    <i className={`${getTipoIcon(e.tipo)} mr-2`}></i>
                                                    <span className="font-medium capitalize">{e.tipo}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 truncate">
                                                    {e.descripcion}
                                                </p>
                                            </div>
                                            <div className="p-3">
                                                <a
                                                    href={e.url_archivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                >
                                                    <i className="fas fa-external-link-alt mr-1"></i>
                                                    Ver archivo
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Subido por: {e.usuario_nombre || 'Usuario'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(e.fecha_creacion).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                            >
                                Cerrar
                            </button>
                            {data.diagnostico_id && (
                                <button
                                    onClick={() => {
                                        // Aquí podrías navegar al diagnóstico o mostrar más detalles
                                        console.log('Ver diagnóstico:', data.diagnostico_id);
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
                                >
                                    <i className="fas fa-external-link-alt mr-2"></i>
                                    Ver diagnóstico asociado
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default DetallesRecomendacionModal;