import React, { useState } from 'react';
import axios from 'axios';
import SubsidioDetallePDF from "../SubsidioDetallePDF/SubsidioDetallePDF.js";

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
    const [showPDF, setShowPDF] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/subsidios-detalle/agregar', formData);
            console.log(response.data);
            setShowPDF(true);
        } catch (error) {
            if (error.response.status === 404 && error.response.data.message === 'El beneficiario ya está asociado a un subsidio detalle o no existe') {
                setShowAlert(true);
            } else {
                console.error('Error al agregar subsidio-detalle:', error);
            }
        }
    };

    const handleCreateBeneficiary = async () => {
        try {
            const response = await axios.post('http://localhost:5000/beneficiarios/crear', formData);
            console.log(response.data);
            setShowModal(false);
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error al crear beneficiario:', error);
        }
    };

    return (
        <div>
            <h2>Agregar Nuevo Subsidio-Detalle</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Agregar Subsidio-Detalle</button>
            </form>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Crear Nuevo Beneficiario</h2>
                        <p>Ingrese los detalles del nuevo beneficiario:</p>
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
                        <button onClick={handleCreateBeneficiary}>Crear Beneficiario</button>
                        <button onClick={() => {
                            setShowModal(false);
                            setFormData({
                                ...formData,
                                TipoDocumento: '',
                                NumeroDocumento: '',
                                Apellido: '',
                                Nombre: ''
                            });
                        }}>Cancelar</button>
                    </div>
                    {showAlert && (
                        <div className="alert">
                            <p>Este beneficiario ya tiene un subsidio detalle asociado.</p>
                            <button onClick={() => setShowAlert(false)}>Cerrar</button>
                        </div>
                    )}
                </div>
            )}

            {showPDF && <SubsidioDetallePDF />}
        </div>
    );
}

export default AgregarSubsidioDetalle;
