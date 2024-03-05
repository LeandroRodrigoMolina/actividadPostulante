import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubsidioDetalleEliminar({ handleActualizarSubsidioDetalle }) {
    const [subsidiosDetalle, setSubsidiosDetalle] = useState([]);
    const [selectedSubsidioDetalleId, setSelectedSubsidioDetalleId] = useState('');
    const [fetchData, setFetchData] = useState(true);

    useEffect(() => {
        const fetchSubsidiosDetalle = async () => {
            try {
                const response = await axios.get('http://localhost:5000/subsidios-detalle');
                const filteredSubsidiosDetalle = response.data.filter(subsidioDetalle => subsidioDetalle.Estado !== 'BA');
                setSubsidiosDetalle(filteredSubsidiosDetalle);
            } catch (error) {
                console.error('Error al obtener los subsidios detalle:', error);
            }
        };

        fetchSubsidiosDetalle();
    }, [fetchData]);

    const handleEliminarSubsidioDetalle = async () => {
        try {
            await axios.delete(`http://localhost:5000/subsidios-detalle/${selectedSubsidioDetalleId}`);
            console.log('Subsidio detalle eliminado correctamente');
            setFetchData(!fetchData); // Invertir el estado para forzar la actualización de la lista
        } catch (error) {
            console.error('Error al eliminar subsidio-detalle:', error);
        }
    };

    return (
        <div>
            <select
                value={selectedSubsidioDetalleId}
                onChange={(e) => setSelectedSubsidioDetalleId(e.target.value)}
            >
                <option value="">Seleccionar Subsidio Detalle a Eliminar</option>
                {subsidiosDetalle.sort((a, b) => a.IdSubsidioDetalle - b.IdSubsidioDetalle).map(subsidioDetalle => (
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
