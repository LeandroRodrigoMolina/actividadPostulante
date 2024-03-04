import React from 'react';

class SubsidioDetallePDF extends React.Component {
    generarPDF = async () => {
        try {
            const response = await fetch('http://localhost:5000/subsidios-detalle/pdf-ultimo');

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

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
