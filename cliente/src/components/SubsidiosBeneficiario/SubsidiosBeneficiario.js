import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

function SubsidiosBeneficiario() {
    const [personaId, setPersonaId] = useState('');
    const [resultados, setResultados] = useState([]);

    const limpiarResultados = () => {
        setResultados([]);
        setPersonaId('');
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(resultados);
        XLSX.utils.book_append_sheet(wb, ws, 'Subsidios');
        XLSX.writeFile(wb, 'subsidios.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Listado de Subsidios', 10, 10);

        let yPos = 20;
        resultados.forEach((subsidio) => {
            doc.text(`ID: ${subsidio.IdSubsidio}`, 10, yPos);
            doc.text(`Descripción: ${subsidio.Descripcion}`, 10, yPos + 5);
            doc.text(`Fecha de Alta: ${subsidio.FechaDeAlta}`, 10, yPos + 10);
            yPos += 20;
        });

        doc.save('subsidios.pdf');
    };

    const handleListarSubsidios = async () => {
        try {
            if (!personaId) {
                alert('Por favor, ingrese el ID de la persona.');
                return;
            }

            limpiarResultados();

            const response = await axios.get(`http://localhost:5000/subsidios/beneficiario/${personaId}`);
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

            <button onClick={exportToExcel}>Exportar a Excel</button>

            <button onClick={exportToPDF}>Exportar a PDF</button>

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
