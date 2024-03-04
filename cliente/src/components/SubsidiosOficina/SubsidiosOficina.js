import React, { useState } from 'react';
import axios from 'axios';

function SubsidiosOficina() {
    const [idOficina, setIdOficina] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [resultados, setResultados] = useState([]);

    // Función para limpiar los resultados previos
    const limpiarResultados = () => {
        setResultados([]);
    };

    const handleListarSubsidiosOficina = async () => {
        try {
            // Validar que los campos no estén vacíos
            if (!idOficina || !fechaInicio || !fechaFin) {
                console.error('Por favor, complete todos los campos.');
                return;
            }

            limpiarResultados(); // Limpiar resultados previos

            const response = await axios.get(`http://localhost:5000/subsidios/oficina/${idOficina}/${fechaInicio}/${fechaFin}`);
            setResultados(response.data);
        } catch (error) {
            console.error('Error al listar subsidios de la oficina:', error);
        }
    };

    return (
        <div>
            <h1>Listado de Subsidios por Oficina</h1>
            <div>
                <label>ID de la Oficina:</label>
                <input type="text" value={idOficina} onChange={(e) => setIdOficina(e.target.value)} />
            </div>
            <div>
                <label>Fecha de Inicio:</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div>
                <label>Fecha de Fin:</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>

            <button onClick={handleListarSubsidiosOficina}>Listar Subsidios por Oficina y Fecha</button>

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

export default SubsidiosOficina;
