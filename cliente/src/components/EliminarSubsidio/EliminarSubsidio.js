import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EliminarSubsidio({ onEliminacionExitosa }) {
    const [subsidios, setSubsidios] = useState([]);
    const [subsidioId, setSubsidioId] = useState('');

    useEffect(() => {
        const fetchSubsidios = async () => {
            try {
                const response = await axios.get('http://localhost:5000/subsidios');
                setSubsidios(response.data);
            } catch (error) {
                console.error('Error al obtener los subsidios:', error);
            }
        };

        fetchSubsidios();
    });

    const handleEliminarSubsidio = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/subsidios/${subsidioId}`);
            console.log(response.data.message);
            // Llamar a la función de eliminación exitosa proporcionada por el componente padre
            onEliminacionExitosa();
        } catch (error) {
            console.error('Error al eliminar subsidio:', error);
            // Manejar el error si es necesario
        }
    };

    return (
        <div>
            <select
                value={subsidioId}
                onChange={(e) => setSubsidioId(e.target.value)}
            >
                <option value="">Seleccionar Subsidio a Eliminar</option>
                {subsidios.map(subsidio => (
                    <option key={subsidio.IdSubsidio} value={subsidio.IdSubsidio}>{subsidio.Descripcion}</option>
                ))}
            </select>
            <button onClick={handleEliminarSubsidio}>Eliminar Subsidio</button>
        </div>
    );
}

export default EliminarSubsidio;
