// AgregarSubsidioDetalle.js
import React, { useState } from 'react';
import axios from 'axios';

function AgregarSubsidioDetalle() {
    const initialFormData = {
        IdSubsidio: '',
        IdBeneficiario: '',
        Importe: '',
        Estado: '',
        TipoDocumento: '',
        NumeroDocumento: '',
        Apellido: '',
        Nombre: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/subsidios-detalle/agregar', formData);
            console.log(response.data); // Manejar la respuesta del servidor según sea necesario
            // Puedes mostrar un mensaje de éxito, limpiar el formulario, etc.
        } catch (error) {
            if (error.response.status === 404 && error.response.data.message === 'Beneficiario no encontrado') {
                setShowModal(true);
            } else {
                console.error('Error al agregar subsidio-detalle:', error);
                // Manejar errores, mostrar mensajes de error al usuario, etc.
            }
        }
    };

    const handleCreateBeneficiary = async () => {
        try {
            const response = await axios.post('http://localhost:5000/beneficiarios/crear', formData);
            console.log(response.data); // Manejar la respuesta del servidor según sea necesario
            setShowModal(false); // Cerrar el modal después de la creación del beneficiario
            setFormData(initialFormData); // Restablecer los valores de los campos
            // Continuar con la lógica para agregar el subsidio-detalle si es necesario
        } catch (error) {
            console.error('Error al crear beneficiario:', error);
            // Manejar errores, mostrar mensajes de error al usuario, etc.
        }
    };

    return (
        <div>
            <h2>Agregar Nuevo Subsidio-Detalle</h2>
            <form onSubmit={handleSubmit}>
                {/* Campos para agregar un subsidio-detalle */}
                <div>
                    <label>ID del Subsidio:</label>
                    <input
                        type="text"
                        name="IdSubsidio"
                        value={formData.IdSubsidio}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>ID del Beneficiario:</label>
                    <input
                        type="text"
                        name="IdBeneficiario"
                        value={formData.IdBeneficiario}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Importe:</label>
                    <input
                        type="text"
                        name="Importe"
                        value={formData.Importe}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Estado:</label>
                    <select
                        name="Estado"
                        value={formData.Estado}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona un estado</option>
                        <option value="AC">AC (Activo)</option>
                        <option value="BA">BA (Baja)</option>
                    </select>
                </div>
                {/* Botón para enviar el formulario */}
                <button type="submit">Agregar Subsidio-Detalle</button>
            </form>

            {/* Ventana emergente para crear un nuevo beneficiario */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Crear Nuevo Beneficiario</h2>
                        <p>Ingrese los detalles del nuevo beneficiario:</p>
                        {/* Campos para el nuevo beneficiario */}
                        <input
                            type="text"
                            name="TipoDocumento"
                            value={formData.TipoDocumento}
                            onChange={handleChange}
                            placeholder="Tipo de Documento"
                        />
                        <input
                            type="text"
                            name="NumeroDocumento"
                            value={formData.NumeroDocumento}
                            onChange={handleChange}
                            placeholder="Número de Documento"
                        />
                        <input
                            type="text"
                            name="Apellido"
                            value={formData.Apellido}
                            onChange={handleChange}
                            placeholder="Apellido"
                        />
                        <input
                            type="text"
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleChange}
                            placeholder="Nombre"
                        />
                        {/* Botones para crear o cancelar la creación del beneficiario */}
                        <button onClick={handleCreateBeneficiary}>Crear Beneficiario</button>
                        <button onClick={() => {
                            setShowModal(false);
                            // Limpiar los campos del nuevo beneficiario al cerrar la ventana
                            setFormData({
                                ...formData,
                                TipoDocumento: '',
                                NumeroDocumento: '',
                                Apellido: '',
                                Nombre: ''
                            });
                        }}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AgregarSubsidioDetalle;
