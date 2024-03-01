import React, { useState } from 'react';
import './App.css';
import SubsidioForm from "../Subsidio/SubsidioForm.js";
import EliminarSubsidio from "../EliminarSubsidio/EliminarSubsidio.js";

const App = () => {
    const handleEliminacionExitosa = () => {
        // Código para manejar la eliminación exitosa del subsidio
        console.log('Subsidio eliminado con éxito');
    };

    return (
        <div>
            <SubsidioForm />
            <EliminarSubsidio onEliminacionExitosa={handleEliminacionExitosa} />
        </div>
    );
};

export default App;
