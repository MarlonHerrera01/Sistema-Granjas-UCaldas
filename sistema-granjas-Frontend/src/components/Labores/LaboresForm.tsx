// src/components/Labores/LaborForm.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { Labor, TipoLabor } from '../../types/laboresTypes';

interface LaborFormProps {
    labor?: Labor;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    tiposLabor: TipoLabor[];
    trabajadores: any[];
    lotes: any[]; // Ahora los lotes YA incluyen granja_nombre
    recomendaciones: any[];
    currentUser: any;
    esEdicion?: boolean;
}

const LaborForm: React.FC<LaborFormProps> = ({
    labor,
    onSubmit,
    onCancel,
    tiposLabor,
    trabajadores,
    lotes, // Ahora lotes ya tienen granja_nombre
    recomendaciones,
    currentUser,
    esEdicion = false
}) => {
    // Hooks al inicio siempre
    const [formData, setFormData] = useState({
        tipo_labor_id: labor?.tipo_labor_id || '',
        trabajador_id: labor?.trabajador_id || '',
        lote_id: labor?.lote_id || '',
        recomendacion_id: labor?.recomendacion_id || '',
        estado: labor?.estado || 'pendiente',
        avance_porcentaje: labor?.avance_porcentaje || 0,
        comentario: labor?.comentario || '',
    });

    // Estados para evidencias
    const [archivos, setArchivos] = useState<File[]>([]);
    const [descripcionesEvidencias, setDescripcionesEvidencias] = useState<string[]>([]);
    const [tiposEvidencia, setTiposEvidencia] = useState<string[]>([]);

    // Roles
    const esAdmin = currentUser?.rol_id === 1;
    const esDocente = currentUser?.rol_id === 2 || currentUser?.rol_id === 5;
    const esTalentoHumano = currentUser?.rol_id === 6;
    const esTrabajador = currentUser?.rol_id === 3;

    // Auto-seleccionar trabajador si es trabajador
    useEffect(() => {
        if (!esEdicion && esTrabajador && !formData.trabajador_id) {
            setFormData(prev => ({ ...prev, trabajador_id: currentUser.id }));
        }
    }, [currentUser, esEdicion, esTrabajador, formData.trabajador_id]);

    // Resetear form cuando se cambia labor
    useEffect(() => {
        if (labor) {
            setFormData({
                tipo_labor_id: labor.tipo_labor_id || '',
                trabajador_id: labor.trabajador_id || '',
                lote_id: labor.lote_id || '',
                recomendacion_id: labor.recomendacion_id || '',
                estado: labor.estado || 'pendiente',
                avance_porcentaje: labor.avance_porcentaje || 0,
                comentario: labor.comentario || '',
            });
        } else if (!esEdicion) {
            // Reset para creación
            setFormData({
                tipo_labor_id: '',
                trabajador_id: esTrabajador ? currentUser.id : '',
                lote_id: '',
                recomendacion_id: '',
                estado: 'pendiente',
                avance_porcentaje: 0,
                comentario: '',
            });
        }
    }, [labor, esEdicion, esTrabajador, currentUser]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    // Funciones para manejar evidencias
    const agregarEvidencia = () => {
        setArchivos(prev => [...prev, null as any]);
        setDescripcionesEvidencias(prev => [...prev, '']);
        setTiposEvidencia(prev => [...prev, 'imagen']);
    };

    const eliminarEvidencia = (index: number) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
        setDescripcionesEvidencias(prev => prev.filter((_, i) => i !== index));
        setTiposEvidencia(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (index: number, file: File | null) => {
        const copia = [...archivos];
        copia[index] = file as any;
        setArchivos(copia);
    };

    const handleDescripcionChange = (index: number, value: string) => {
        const copia = [...descripcionesEvidencias];
        copia[index] = value;
        setDescripcionesEvidencias(copia);
    };

    const handleTipoEvidenciaChange = (index: number, value: string) => {
        const copia = [...tiposEvidencia];
        copia[index] = value;
        setTiposEvidencia(copia);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.tipo_labor_id || !formData.lote_id || !formData.trabajador_id) {
            toast.error('Por favor completa los campos requeridos');
            return;
        }

        // Preparar evidencias para enviar
        const evidencias = archivos
            .map((file, index) => ({
                file,
                descripcion: descripcionesEvidencias[index],
                tipo: tiposEvidencia[index]
            }))
            .filter(ev => ev.file);

        // Preparar datos para enviar
        const datosSubmit: any = {
            tipo_labor_id: parseInt(formData.tipo_labor_id as string),
            trabajador_id: parseInt(formData.trabajador_id as string),
            lote_id: parseInt(formData.lote_id as string),
        };

        // Incluir recomendación si se seleccionó
        if (formData.recomendacion_id) {
            datosSubmit.recomendacion_id = parseInt(formData.recomendacion_id as string);
        }

        // Incluir comentario si existe
        if (formData.comentario) {
            datosSubmit.comentario = formData.comentario;
        }

        // Incluir estado y avance solo en edición
        if (esEdicion) {
            datosSubmit.estado = formData.estado;
            datosSubmit.avance_porcentaje = formData.avance_porcentaje;
        }

        // Incluir evidencias si hay
        if (evidencias.length > 0) {
            datosSubmit.evidencias = evidencias;
        }

        console.log("📤 Enviando datos de labor:", datosSubmit);
        onSubmit(datosSubmit);
    };

    const estadosLabor = [
        { value: 'pendiente', label: 'Pendiente', color: 'text-yellow-600' },
        { value: 'en_progreso', label: 'En Progreso', color: 'text-blue-600' },
        { value: 'completada', label: 'Completada', color: 'text-green-600' },
        { value: 'cancelada', label: 'Cancelada', color: 'text-red-600' },
    ];

    return (
        <div className="p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-3">
                {esEdicion ? 'Editar Labor' : 'Nueva Labor'}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">

                    {/* Tipo de labor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Labor *
                        </label>
                        <select
                            name="tipo_labor_id"
                            value={formData.tipo_labor_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar tipo</option>
                            {tiposLabor.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre} - {tipo.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Trabajador */}
                    {(esAdmin || esDocente || esTalentoHumano) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trabajador *
                            </label>
                            <select
                                name="trabajador_id"
                                value={formData.trabajador_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Seleccionar trabajador</option>
                                {trabajadores.map(trab => (
                                    <option key={trab.id} value={trab.id}>
                                        {trab.nombre} ({trab.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Trabajador lectura (si es trabajador) */}
                    {esTrabajador && !esAdmin && !esDocente && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Trabajador
                            </label>
                            <div className="border border-gray-300 p-3 rounded bg-gray-50">
                                {currentUser.nombre} ({currentUser.email})
                            </div>
                        </div>
                    )}

                    {/* Lote - AHORA los lotes ya tienen granja_nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lote *
                        </label>
                        <select
                            name="lote_id"
                            value={formData.lote_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar lote</option>
                            {lotes.map(lote => (
                                <option key={lote.id} value={lote.id}>
                                    {lote.nombre} - {lote.granja_nombre || 'Sin granja'}
                                    {lote.nombre_cultivo ? ` (${lote.nombre_cultivo})` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona un lote y su granja correspondiente
                        </p>
                    </div>

                    {/* Recomendación (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recomendación Asociada (Opcional)
                        </label>
                        <select
                            name="recomendacion_id"
                            value={formData.recomendacion_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Sin recomendación asociada</option>
                            {recomendaciones.map(rec => (
                                <option key={rec.id} value={rec.id}>
                                    #{rec.id} - {rec.titulo} ({rec.estado})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Asocia esta labor a una recomendación específica
                        </p>
                    </div>

                    {/* Estado (solo en edición) */}
                    {esEdicion && (esAdmin || esTalentoHumano || esTrabajador) && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {estadosLabor.map(estado => (
                                        <option key={estado.value} value={estado.value} className={estado.color}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Avance */}
                            {(esTalentoHumano || esAdmin || esTrabajador) && (<div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Avance (%)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        name="avance_porcentaje"
                                        min="0"
                                        max="100"
                                        value={formData.avance_porcentaje}
                                        onChange={handleNumberChange}
                                        className="flex-1"
                                    />
                                    <span className="w-16 text-center font-medium bg-gray-100 px-2 py-1 rounded">
                                        {formData.avance_porcentaje}%
                                    </span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">0%</span>
                                    <span className="text-xs text-gray-500">50%</span>
                                    <span className="text-xs text-gray-500">100%</span>
                                </div>
                            </div>)}
                        </>
                    )}

                    {/* Comentario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comentario (Opcional)
                        </label>
                        <textarea
                            name="comentario"
                            value={formData.comentario}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Observaciones, instrucciones especiales, etc."
                        />
                    </div>

                    {/* SECCIÓN DE EVIDENCIAS */}
                    <div className="mt-4">
                        <div className="flex justify-between mb-2">
                            <label className="font-medium text-gray-700">Evidencias Iniciales</label>
                            <button
                                type="button"
                                onClick={agregarEvidencia}
                                className="text-blue-600 text-sm hover:text-blue-800"
                            >
                                + Agregar evidencia
                            </button>
                        </div>

                        {archivos.map((_, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                                <div className="flex justify-between mb-3">
                                    <span className="font-medium text-sm text-gray-700">Evidencia {index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => eliminarEvidencia(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        ✕ Eliminar
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">Tipo</label>
                                        <select
                                            value={tiposEvidencia[index]}
                                            onChange={(e) => handleTipoEvidenciaChange(index, e.target.value)}
                                            className="w-full border rounded p-2 text-sm"
                                        >
                                            <option value="imagen">Imagen</option>
                                            <option value="video">Video</option>
                                            <option value="documento">Documento</option>
                                            <option value="audio">Audio</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-600 mb-1 block">Descripción</label>
                                        <input
                                            type="text"
                                            value={descripcionesEvidencias[index]}
                                            onChange={(e) => handleDescripcionChange(index, e.target.value)}
                                            className="w-full border rounded p-2 text-sm"
                                            placeholder="Describe esta evidencia"
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-sm text-gray-600 mb-1 block">Archivo</label>
                                        <input
                                            type="file"
                                            className="w-full text-sm"
                                            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                            onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Formatos aceptados: imágenes, videos, PDF, Word
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {archivos.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                                <i className="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-3"></i>
                                <p className="text-gray-500">No hay evidencias iniciales</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Puedes agregar fotos, documentos u otros archivos como evidencia inicial
                                </p>
                                <button
                                    type="button"
                                    onClick={agregarEvidencia}
                                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    <i className="fas fa-plus mr-1"></i>
                                    Agregar primera evidencia
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center"
                    >
                        {esEdicion ? (
                            <>
                                <i className="fas fa-save mr-2"></i>
                                Actualizar Labor
                            </>
                        ) : (
                            <>
                                <i className="fas fa-plus mr-2"></i>
                                Crear Labor
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LaborForm;