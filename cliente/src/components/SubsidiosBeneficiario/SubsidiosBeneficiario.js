import React, { useState } from 'react';
import axios from 'axios';

function SubsidiosBeneficiario() {
    const [personaId, setPersonaId] = useState('');
    const [resultados, setResultados] = useState([]);

    const handleListarSubsidios = async () => {
        try {
            // Realizar una solicitud GET al backend para obtener los subsidios de la persona
            console.log('Valor de personaId:', personaId);
            const response = await axios.get(`http://localhost:5000/subsidios/beneficiario/${personaId}`);
            // Establecer los resultados obtenidos del backend en el estado
            setResultados(response.data);
        } catch (error) {
            console.error('Error al listar subsidios:', error);
        }
    };

    return (
        <div>
            <h1>Listado de Subsidios</h1>
            <div>
                <label>ID de la Persona:</label>
                <input type="text" value={personaId} onChange={(e) => setPersonaId(e.target.value)} />
            </div>

            <button onClick={handleListarSubsidios}>Listar Subsidios</button>

            <div>
                {resultados.map((subsidio) => (
                    <div key={subsidio.IdSubsidio}>
                        <p>ID: {subsidio.IdSubsidio}</p>
                        <p>Descripción: {subsidio.Descripcion}</p>
                        <p>Fecha de Alta: {subsidio.FechaDeAlta}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default SubsidiosBeneficiario;
