// src/components/Recomendaciones/AprobarRecomendacionModal.tsx
import React, { useState } from 'react';
import Modal from '../Common/Modal';

interface AprobarRecomendacionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAprobar: (observaciones: string) => void;
    tituloRecomendacion: string;
}

const AprobarRecomendacionModal: React.FC<AprobarRecomendacionModalProps> = ({
    isOpen,
    onClose,
    onAprobar,
    tituloRecomendacion
}) => {
    const [observaciones, setObservaciones] = useState('');

    const handleSubmit = () => {
        onAprobar(observaciones);
        resetAndClose();
    };

    const resetAndClose = () => {
        setObservaciones('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} width="max-w-md">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                    Aprobar Recomendación
                </h2>

                <p className="mb-4">
                    Estás por <strong>aprobar</strong> la recomendación:
                    <br />
                    <strong className="text-blue-600">{tituloRecomendacion}</strong>
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones (opcional)
                    </label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Ej: Recomendación aprobada tras revisión del lote..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Estas observaciones quedarán registradas en el historial de la recomendación.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                        <i className="fas fa-check mr-2"></i>
                        Confirmar Aprobación
                    </button>
                    <button
                        onClick={resetAndClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AprobarRecomendacionModal;