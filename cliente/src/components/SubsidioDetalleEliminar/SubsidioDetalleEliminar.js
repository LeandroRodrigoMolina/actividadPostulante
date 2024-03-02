// SubsidioDetalleEliminar.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubsidioDetalleEliminar({ onEliminacionExitosa }) {
    const [subsidiosDetalle, setSubsidiosDetalle] = useState([]);
    const [selectedSubsidioDetalleId, setSelectedSubsidioDetalleId] = useState('');

    useEffect(() => {
        const fetchSubsidiosDetalle = async () => {
            try {
                const response = await axios.get('http://localhost:5000/subsidios-detalle');
                setSubsidiosDetalle(response.data);
            } catch (error) {
                console.error('Error al obtener los subsidios detalle:', error);
            }
        };

        fetchSubsidiosDetalle();
    }, []);

    const handleEliminarSubsidioDetalle = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/subsidios-detalle/${selectedSubsidioDetalleId}`);
            console.log(response.data.message);
            // Llamar a la función de eliminación exitosa proporcionada por el componente padre
            onEliminacionExitosa();
        } catch (error) {
            console.error('Error al eliminar subsidio-detalle:', error);
            // Manejar el error si es necesario
        }
    };

    return (
        <div>
            <select
                value={selectedSubsidioDetalleId}
                onChange={(e) => setSelectedSubsidioDetalleId(e.target.value)}
            >
                <option value="">Seleccionar Subsidio Detalle a Eliminar</option>
                {subsidiosDetalle.map(subsidioDetalle => (
                    <option key={subsidioDetalle.IdSubsidioDetalle} value={subsidioDetalle.IdSubsidioDetalle}>
                        Subsidio detalle ID: {subsidioDetalle.IdSubsidioDetalle} - Beneficiario: {subsidioDetalle.NombreBeneficiario} {subsidioDetalle.ApellidoBeneficiario}
                    </option>
                ))}
            </select>
            <button onClick={handleEliminarSubsidioDetalle}>Eliminar Subsidio Detalle</button>
        </div>
    );
}

export default SubsidioDetalleEliminar;
