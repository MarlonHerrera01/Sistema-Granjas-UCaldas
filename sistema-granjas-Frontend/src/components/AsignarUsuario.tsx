import Modal from "../components/Modal";

export const AsignarUsuarioModal = ({
    isOpen,
    onClose,
    usuarios,
    usuariosGranja,
    usuarioSeleccionado,
    setUsuarioSeleccionado,
    onAsignar
}: any) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold mb-4">Asignar Usuario</h3>

            <div className="space-y-4">
                <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
                    className="w-full border rounded-md px-3 py-2"
                >
                    <option value={0}>Seleccione un usuario</option>
                    {usuarios
                        .filter((u: any) => !usuariosGranja.some((ug: any) => ug.id === u.id))
                        .map((u: any) => (
                            <option key={u.id} value={u.id}>
                                {u.nombre} - {u.email}
                            </option>
                        ))}
                </select>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="text-gray-600 px-4 py-2">
                        Cancelar
                    </button>
                    <button
                        onClick={onAsignar}
                        disabled={!usuarioSeleccionado}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Asignar
                    </button>
                </div>
            </div>
        </Modal>
    );
};
