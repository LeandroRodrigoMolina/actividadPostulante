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
        const ws = XLSX.utils.json_to_sheet(resultados.map(subsidio => ({
            'ID del Subsidio': subsidio.IdSubsidio,
            'Descripción del Subsidio': subsidio.Descripcion,
            'Fecha de Alta del Subsidio': subsidio.FechaDeAlta,
            'Oficina donde está el subsidio': subsidio.IdOficina,
            'Estado del subsidio': subsidio.Estado
        })));
        XLSX.utils.book_append_sheet(wb, ws, 'Subsidios');
        XLSX.writeFile(wb, 'subsidios.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Listado de Subsidios del beneficiario', 10, 10);

        let yPos = 20;
        resultados.forEach((subsidio) => {
            doc.text(`ID del Subsidio: ${subsidio.IdSubsidio}`, 10, yPos);
            doc.text(`Descripción del Subsidio: ${subsidio.Descripcion}`, 10, yPos + 5);
            doc.text(`Fecha de Alta del Subsidio: ${subsidio.FechaDeAlta}`, 10, yPos + 10);
            doc.text(`Oficina donde está el subsidio: ${subsidio.IdOficina}`, 10, yPos + 15);
            doc.text(`Estado del subsidio: ${subsidio.Estado}`, 10, yPos + 20);
            yPos += 30;
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
                {resultados.map((subsidio, index) => (
                    <div key={`${subsidio.IdSubsidio}-${index}`}>
                        <p>ID del Subsidio: {subsidio.IdSubsidio}</p>
                        <p>Descripción del Subsidio: {subsidio.Descripcion}</p>
                        <p>Fecha de Alta del Subsidio: {subsidio.FechaDeAlta}</p>
                        <p>Oficina donde esta el subsidio: {subsidio.IdOficina}</p>
                        <p>Estado del subsidio: {subsidio.Estado}</p>
                        <br/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubsidiosBeneficiario;
