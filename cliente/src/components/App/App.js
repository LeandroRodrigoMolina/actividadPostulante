import React, { useState, useEffect } from 'react';
import './App.css';
import SubsidioForm from "../Subsidio/SubsidioForm.js";
import EliminarSubsidio from "../EliminarSubsidio/EliminarSubsidio.js";
import AgregarSubsidioDetalle from "../SubsidioDetalle/AgregarSubsidioDetalle.js";
import SubsidioDetalleEliminar from "../SubsidioDetalleEliminar/SubsidioDetalleEliminar.js"; // Importa el nuevo componente
import SubsidiosListados from "../SubsidiosListados/SubsidiosListados.js";

import axios from 'axios';

const App = () => {
    const [subsidios, setSubsidios] = useState([]);

    // Función para cargar la lista de subsidios al montar el componente
    useEffect(() => {
        cargarSubsidios();
    }, []);

    // Función para cargar la lista de subsidios
    const cargarSubsidios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/subsidios');
            setSubsidios(response.data);
        } catch (error) {
            console.error('Error al cargar subsidios:', error);
        }
    };

    // Función para manejar la eliminación exitosa de un subsidio
    const handleEliminacionExitosa = () => {
        // Actualizar la lista de subsidios después de la eliminación
        cargarSubsidios();
    };

    return (
        <div>
            <SubsidioForm onSubsidioCreado={cargarSubsidios} />
            <EliminarSubsidio onEliminacionExitosa={handleEliminacionExitosa} />
            <AgregarSubsidioDetalle />
            <SubsidioDetalleEliminar onEliminacionExitosa={handleEliminacionExitosa} />
            <SubsidiosListados />
        </div>
    );
};

export default App;
