import React, { useState, useEffect } from 'react';
import './App.css';
import SubsidioForm from "../SubsidioForm/SubsidioForm.js";
import EliminarSubsidio from "../EliminarSubsidio/EliminarSubsidio.js";
import AgregarSubsidioDetalle from "../AgregarSubsidioDetalle/AgregarSubsidioDetalle.js";
import SubsidioDetalleEliminar from "../SubsidioDetalleEliminar/SubsidioDetalleEliminar.js";
import SubsidiosBeneficiario from "../SubsidiosBeneficiario/SubsidiosBeneficiario.js";
import SubsidiosOficina from "../SubsidiosOficina/SubsidiosOficina.js";
import axios from 'axios';

const App = () => {
    const [subsidios, setSubsidios] = useState([]);

    useEffect(() => {
        cargarSubsidios();
    }, []);

    const cargarSubsidios = async () => {
        try {
            const response = await axios.get('http://localhost:5000/subsidios');
            setSubsidios(response.data);
        } catch (error) {
            console.error('Error al cargar subsidios:', error);
        }
    };

    const handleEliminacionExitosa = () => {
        cargarSubsidios();
    };

    const handleActualizarSubsidioDetalle = () => {
        cargarSubsidios();
    };

    return (
        <div>
            <SubsidioForm handleEliminacionExitosa={handleEliminacionExitosa} />
            <EliminarSubsidio onEliminacionExitosa={handleEliminacionExitosa} />
            <AgregarSubsidioDetalle handleCrearSubsidioDetalle={handleActualizarSubsidioDetalle} />
            <SubsidioDetalleEliminar handleActualizarSubsidioDetalle={handleActualizarSubsidioDetalle} />
            <SubsidiosBeneficiario />
            <SubsidiosOficina />
        </div>
    );
};

export default App;
