import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de haber instalado axios en tu proyecto

function AgregarSubsidioDetalle() {
    const [formData, setFormData] = useState({
        IdSubsidio: '',
        IdBeneficiario: '',
        Importe: '',
        Estado: ''
    });

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
            console.error('Error al agregar subsidio-detalle:', error);
            // Manejar errores, mostrar mensajes de error al usuario, etc.
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
                        <option value="AC">AC</option>
                        <option value="BA">BA</option>
                    </select>
                </div>
                <button type="submit">Agregar Subsidio-Detalle</button>
            </form>
        </div>
    );
}

export default AgregarSubsidioDetalle;
