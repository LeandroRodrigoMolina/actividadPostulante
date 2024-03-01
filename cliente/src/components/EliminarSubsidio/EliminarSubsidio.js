import React, { useState } from 'react';
import axios from 'axios';

function EliminarSubsidio({ onEliminacionExitosa }) {
    const [subsidioId, setSubsidioId] = useState('');

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
            <input
                type="text"
                placeholder="ID del subsidio a eliminar"
                value={subsidioId}
                onChange={(e) => setSubsidioId(e.target.value)}
            />
            <button onClick={handleEliminarSubsidio}>Eliminar Subsidio</button>
        </div>
    );
}

export default EliminarSubsidio;
