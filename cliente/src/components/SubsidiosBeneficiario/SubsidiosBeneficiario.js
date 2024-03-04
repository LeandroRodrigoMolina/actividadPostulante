import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

function SubsidiosBeneficiario() {
    const [personaId, setPersonaId] = useState('');
    const [resultados, setResultados] = useState([]);

    // Función para limpiar los resultados previos y los campos de entrada
    const limpiarResultados = () => {
        setResultados([]);
        setPersonaId('');
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(resultados);
        XLSX.utils.book_append_sheet(wb, ws, 'Subsidios');
        XLSX.writeFile(wb, 'subsidios.xlsx');
    };

    // Función para exportar a PDF
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
            // Validar que el campo no esté vacío
            if (!personaId) {
                alert('Por favor, ingrese el ID de la persona.');
                return;
            }

            limpiarResultados(); // Limpiar resultados previos y campos de entrada

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

            {/* Botón para exportar a Excel */}
            <button onClick={exportToExcel}>Exportar a Excel</button>

            {/* Botón para exportar a PDF */}
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
