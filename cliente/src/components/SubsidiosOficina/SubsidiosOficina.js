import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

function SubsidiosOficina() {
    const [idOficina, setIdOficina] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [resultados, setResultados] = useState([]);

    // Función para limpiar los campos y los resultados previos
    const limpiarCamposYResultados = () => {
        setIdOficina('');
        setFechaInicio('');
        setFechaFin('');
        setResultados([]);
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(resultados);
        XLSX.utils.book_append_sheet(wb, ws, 'Subsidios');
        XLSX.writeFile(wb, 'subsidios_oficina.xlsx');
    };

    // Función para exportar a PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Listado de Subsidios por Oficina', 10, 10);

        let yPos = 20;
        resultados.forEach((subsidio) => {
            doc.text(`ID: ${subsidio.IdSubsidio}`, 10, yPos);
            doc.text(`Descripción: ${subsidio.Descripcion}`, 10, yPos + 5);
            doc.text(`Fecha de Alta: ${subsidio.FechaDeAlta}`, 10, yPos + 10);
            yPos += 20;
        });

        doc.save('subsidios_oficina.pdf');
    };

    const handleListarSubsidiosOficina = async () => {
        try {
            // Validar que los campos no estén vacíos
            if (!idOficina || !fechaInicio || !fechaFin) {
                alert('Por favor, complete todos los campos.');
                return;
            }

            limpiarCamposYResultados(); // Limpiar campos y resultados previos

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

            {/* Botón para exportar a Excel */}
            <button onClick={exportToExcel}>Exportar a Excel</button>

            {/* Botón para exportar a PDF */}
            <button onClick={exportToPDF}>Exportar a PDF</button>

            <div>
                {resultados.map((subsidio) => (
                    <div key={`subsidio_${subsidio.IdSubsidio}`}>
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
