import React from 'react';

class SubsidioDetallePDF extends React.Component {
    generarPDF = async () => {
        try {
            // Realiza una solicitud GET al endpoint en el backend que genera el PDF del último subsidio detalle
            const response = await fetch('http://localhost:5000/subsidios-detalle/pdf-ultimo');

            // Verifica si la solicitud fue exitosa (código de estado 200)
            if (response.ok) {
                // Convierte la respuesta a un blob (archivo binario)
                const blob = await response.blob();

                // Crea una URL para el blob
                const url = window.URL.createObjectURL(blob);

                // Crea un enlace temporal y haz clic en él para iniciar la descarga del PDF
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ultimo_subsidio_detalle.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                console.error('Error al generar el PDF:', response.statusText);
            }
        } catch (error) {
            console.error('Error al generar el PDF:', error);
        }
    };

    render() {
        return (
            <div>
                <h2>Generar PDF del Último Subsidio Detalle</h2>
                <button onClick={this.generarPDF}>Generar PDF</button>
            </div>
        );
    }
}

export default SubsidioDetallePDF;
