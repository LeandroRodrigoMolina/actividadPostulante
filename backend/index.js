// Importar los módulos necesarios
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Importar el paquete CORS
const PDFDocument = require('pdfkit'); // Importa la librería pdfkit

// Crear una instancia de la aplicación Express
const app = express();
const PORT = process.env.APP_PORT || 5000; // Usar el puerto de la variable de entorno o 5000 por defecto

// Configurar la conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT // Usar el puerto de la variable de entorno
});

// Conectar a la base de datos MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos: ', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

// Middleware para procesar el cuerpo de las solicitudes
app.use(express.json());

// Configurar CORS para permitir solicitudes desde todos los orígenes
app.use(cors());

const agregarSubsidioDetalle = async (req, res) => {
    try {
        const { IdSubsidio, IdBeneficiario, Importe, Estado } = req.body;

        // Verificar si el beneficiario ya existe en la base de datos
        const beneficiarioExistente = await verificarBeneficiarioExistente(IdBeneficiario);

        // Si el beneficiario no existe, enviar una indicación al frontend para que lo cree
        if (!beneficiarioExistente) {
            return res.status(404).json({ message: 'Beneficiario no encontrado', IdBeneficiario });
        }

        // Realizar la inserción del subsidio-detalle en la base de datos
        const sql = `INSERT INTO SubsidiosDetalle (IdSubsidio, IdBeneficiario, Importe, Estado) VALUES (?, ?, ?, ?)`;
        connection.query(sql, [IdSubsidio, IdBeneficiario, Importe, Estado], (err, result) => {
            if (err) {
                console.error('Error al agregar subsidio-detalle:', err);
                res.status(500).json({ message: 'Error al agregar subsidio-detalle' });
                return;
            }
            console.log('Subsidio-detalle agregado correctamente');
            res.status(201).json({ message: 'Subsidio-detalle agregado correctamente' });
        });
    } catch (error) {
        console.error('Error al agregar subsidio-detalle:', error);
        res.status(500).json({ message: 'Error al agregar subsidio-detalle' });
    }
};

// Función para verificar si el beneficiario existe en la base de datos
const verificarBeneficiarioExistente = async (IdBeneficiario) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM SubsidiosDetalle WHERE IdBeneficiario = ?';
        connection.query(sql, [IdBeneficiario], (err, rows) => {
            if (err) {
                console.error('Error al verificar beneficiario existente:', err);
                reject(err);
            } else {
                // Si hay algún resultado, significa que el beneficiario ya está asociado a un subsidio detalle
                resolve(rows.length === 0);
            }
        });
    });
};

// Ruta para registrar un nuevo subsidio
app.post('/subsidios/registrar', (req, res) => {
    const { Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado } = req.body;

    // Realiza la inserción en la base de datos
    const sql = `INSERT INTO Subsidios (Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado) VALUES (?, ?, ?, ?, ?, ?, false)`;
    connection.query(sql, [Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado], (err, result) => {
        if (err) {
            console.error('Error al insertar subsidio:', err);
            res.status(500).json({ message: 'Error al insertar subsidio' });
            return;
        }
        console.log('Subsidio registrado correctamente');
        res.status(200).json({ message: 'Subsidio registrado correctamente' });
    });
});

// Ruta para agregar un nuevo subsidio-detalle
app.post('/subsidios-detalle/agregar', async (req, res) => {
    const { IdSubsidio, IdBeneficiario, Importe, Estado } = req.body;

    try {
        // Verificar si el beneficiario ya existe y no está asociado a ningún subsidio detalle
        const beneficiarioExistente = await verificarBeneficiarioExistente(IdBeneficiario);

        // Si el beneficiario no existe o ya está asociado a un subsidio detalle, enviar una indicación al frontend
        if (!beneficiarioExistente) {
            return res.status(404).json({ message: 'El beneficiario ya está asociado a un subsidio detalle o no existe', IdBeneficiario });
        }

        // Realizar la inserción del subsidio-detalle en la base de datos
        const sql = `INSERT INTO SubsidiosDetalle (IdSubsidio, IdBeneficiario, Importe, Estado) VALUES (?, ?, ?, ?)`;
        connection.query(sql, [IdSubsidio, IdBeneficiario, Importe, Estado], (err, result) => {
            if (err) {
                console.error('Error al agregar subsidio-detalle:', err);
                res.status(500).json({ message: 'Error al agregar subsidio-detalle' });
                return;
            }
            console.log('Subsidio-detalle agregado correctamente');

            // Obtener información del beneficiario
            const sqlBeneficiario = 'SELECT * FROM Beneficiarios WHERE IdBeneficiario = ?';
            connection.query(sqlBeneficiario, [IdBeneficiario], (err, beneficiarioResult) => {
                if (err) {
                    console.error('Error al obtener información del beneficiario:', err);
                    res.status(500).json({ message: 'Error al obtener información del beneficiario' });
                    return;
                }

                // Generar el PDF que contiene el subsidio detalle recién creado y la información del beneficiario
                generatePDF({
                    IdSubsidioDetalle: result.insertId,
                    IdSubsidio,
                    IdBeneficiario,
                    Importe,
                    Estado,
                    Beneficiario: beneficiarioResult[0]
                }, res);
            });
        });
    } catch (error) {
        console.error('Error al agregar subsidio-detalle:', error);
        res.status(500).json({ message: 'Error al agregar subsidio-detalle' });
    }
});

// Ruta para generar un PDF con los datos del último subsidio detalle
app.get('/subsidios-detalle/pdf-ultimo', async (req, res) => {
    try {
        const doc = new PDFDocument(); // Crea un nuevo documento PDF

        // Establece el encabezado y el tipo de contenido de la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=subsidio_detalle_ultimo.pdf');

        // Pipe the PDF into the response stream
        doc.pipe(res);

        // Consulta para obtener solo el último subsidio detalle y la información del beneficiario
        const sql = `SELECT sd.IdSubsidioDetalle, sd.IdSubsidio, sd.IdBeneficiario, sd.Importe, sd.Estado,
                            b.TipoDocumento, b.NumeroDocumento, b.Apellido, b.Nombre
                     FROM SubsidiosDetalle sd
                     INNER JOIN Beneficiarios b ON sd.IdBeneficiario = b.IdBeneficiario
                     ORDER BY sd.IdSubsidioDetalle DESC
                     LIMIT 1`;

        // Ejecuta la consulta en la base de datos
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Error al obtener el último subsidio detalle:', err);
                res.status(500).json({ message: 'Error al obtener el último subsidio detalle' });
                return;
            }

            // Verifica si se encontró un subsidio detalle
            if (result.length > 0) {
                const subsidioDetalle = result[0];

                // Agrega los datos del subsidio detalle al PDF
                doc
                    .fontSize(12)
                    .text(`Subsidio detalle ID: ${subsidioDetalle.IdSubsidioDetalle}`, { align: 'left' })
                    .text(`ID de Subsidio: ${subsidioDetalle.IdSubsidio}`, { align: 'left' })
                    .text(`ID de Beneficiario: ${subsidioDetalle.IdBeneficiario}`, { align: 'left' })
                    .text(`Importe: ${subsidioDetalle.Importe}`, { align: 'left' })
                    .text(`Estado: ${subsidioDetalle.Estado}`, { align: 'left' })
                    .text(`Tipo de Documento: ${subsidioDetalle.TipoDocumento}`, { align: 'left' })
                    .text(`Número de Documento: ${subsidioDetalle.NumeroDocumento}`, { align: 'left' })
                    .text(`Apellido: ${subsidioDetalle.Apellido}`, { align: 'left' })
                    .text(`Nombre: ${subsidioDetalle.Nombre}`, { align: 'left' });
            } else {
                console.log('No se encontraron subsidios detalles.');
                doc.text('No se encontraron subsidios detalles.');
            }

            // Finaliza el documento PDF
            doc.end();
        });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
});

// Función para generar el PDF con los subsidios detalle especificados y la información del beneficiario
const generatePDF = (subsidioDetalle, res) => {
    try {
        const doc = new PDFDocument(); // Crea un nuevo documento PDF

        // Establece el encabezado y el tipo de contenido de la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=subsidios_detalle.pdf');

        // Pipe the PDF into the response stream
        doc.pipe(res);

        // Agrega los datos del subsidio detalle al PDF
        doc
            .fontSize(12)
            .text(`Subsidio detalle ID: ${subsidioDetalle.IdSubsidioDetalle}`, { align: 'left' })
            .text(`ID de Subsidio: ${subsidioDetalle.IdSubsidio}`, { align: 'left' })
            .text(`ID de Beneficiario: ${subsidioDetalle.IdBeneficiario}`, { align: 'left' })
            .text(`Importe: ${subsidioDetalle.Importe}`, { align: 'left' })
            .text(`Estado: ${subsidioDetalle.Estado}`, { align: 'left' })
            .text(`Datos del Beneficiario:`, { align: 'left' })
            .text(`Tipo de Documento: ${subsidioDetalle.Beneficiario.TipoDocumento}`, { align: 'left' })
            .text(`Número de Documento: ${subsidioDetalle.Beneficiario.NumeroDocumento}`, { align: 'left' })
            .text(`Apellido: ${subsidioDetalle.Beneficiario.Apellido}`, { align: 'left' })
            .text(`Nombre: ${subsidioDetalle.Beneficiario.Nombre}`, { align: 'left' });

        // Finaliza el documento PDF
        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
};

// Ruta para crear un nuevo beneficiario
app.post('/beneficiarios/crear', (req, res) => {
    const { IdBeneficiario, TipoDocumento, NumeroDocumento, Apellido, Nombre } = req.body;

    // Realizar la inserción en la base de datos
    const sql = `INSERT INTO Beneficiarios (IdBeneficiario, TipoDocumento, NumeroDocumento, Apellido, Nombre) 
                 VALUES (?, ?, ?, ?, ?)`;
    connection.query(sql, [IdBeneficiario, TipoDocumento, NumeroDocumento, Apellido, Nombre], (err, result) => {
        if (err) {
            console.error('Error al crear beneficiario:', err);
            res.status(500).json({ message: 'Error al crear beneficiario' });
            return;
        }
        console.log('Beneficiario creado correctamente');
        res.status(201).json({ message: 'Beneficiario creado correctamente' });
    });
});


// Ruta para obtener las oficinas disponibles
app.get('/oficinas', (req, res) => {
    const sql = 'SELECT IdOficina, Descripcion FROM Oficinas';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener las oficinas:', err);
            res.status(500).json({ message: 'Error al obtener las oficinas' });
            return;
        }
        res.status(200).json(results);
    });
});

// Ruta para eliminar un subsidio existente
app.put('/subsidios/:id', (req, res) => {
    const subsidioId = req.params.id;

    // Realiza la actualización en la base de datos para marcar el subsidio como eliminado
    const sql = `UPDATE Subsidios SET Eliminado = true WHERE IdSubsidio = ?`;
    connection.query(sql, [subsidioId], (err, result) => {
        if (err) {
            console.error('Error al eliminar subsidio:', err);
            res.status(500).json({ message: 'Error al eliminar subsidio' });
            return;
        }
        console.log('Subsidio eliminado correctamente');
        res.status(200).json({ message: 'Subsidio eliminado correctamente' });
    });
});

// Ruta para obtener los subsidios existentes que no han sido eliminados
app.get('/subsidios', (req, res) => {
    const sql = 'SELECT * FROM Subsidios WHERE Eliminado = false';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los subsidios:', err);
            res.status(500).json({ message: 'Error al obtener los subsidios' });
            return;
        }
        res.status(200).json(results);
    });
});

// Ruta para eliminar un subsidio-detalle existente
app.delete('/subsidios-detalle/:id', (req, res) => {
    const subsidioDetalleId = req.params.id;

    // Realiza la eliminación en la base de datos
    const sql = `DELETE FROM SubsidiosDetalle WHERE IdSubsidioDetalle = ?`;
    connection.query(sql, [subsidioDetalleId], (err, result) => {
        if (err) {
            console.error('Error al eliminar subsidio-detalle:', err);
            res.status(500).json({ message: 'Error al eliminar subsidio-detalle' });
            return;
        }
        console.log('Subsidio-detalle eliminado correctamente');
        res.status(200).json({ message: 'Subsidio-detalle eliminado correctamente' });
    });
});

// Ruta para obtener los subsidios detalle existentes
app.get('/subsidios-detalle', (req, res) => {
    const sql = `SELECT sd.IdSubsidioDetalle, sd.IdSubsidio, sd.IdBeneficiario, sd.Importe, sd.Estado, 
                        b.Nombre AS NombreBeneficiario, b.Apellido AS ApellidoBeneficiario
                 FROM SubsidiosDetalle sd
                 INNER JOIN Beneficiarios b ON sd.IdBeneficiario = b.IdBeneficiario`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los subsidios detalle:', err);
            res.status(500).json({ message: 'Error al obtener los subsidios detalle' });
            return;
        }
        res.status(200).json(results);
    });
});

// Ruta para generar un PDF con los datos de los subsidios detalle
app.get('/subsidios-detalle/pdf', async (req, res) => {
    try {
        const doc = new PDFDocument(); // Crea un nuevo documento PDF

        // Establece el encabezado y el tipo de contenido de la respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=subsidios_detalle.pdf');

        // Pipe the PDF into the response stream
        doc.pipe(res);

        // Consulta para obtener los datos de los subsidios detalle y los beneficiarios
        const sql = `SELECT sd.IdSubsidioDetalle, sd.IdSubsidio, sd.IdBeneficiario, sd.Importe, sd.Estado,
                            b.TipoDocumento, b.NumeroDocumento, b.Apellido, b.Nombre
                     FROM SubsidiosDetalle sd
                     INNER JOIN Beneficiarios b ON sd.IdBeneficiario = b.IdBeneficiario`;

        // Ejecuta la consulta en la base de datos
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error al obtener los subsidios detalle:', err);
                res.status(500).json({ message: 'Error al obtener los subsidios detalle' });
                return;
            }

            // Itera sobre los resultados y agrega los datos al PDF
            results.forEach((subsidioDetalle, index) => {
                doc
                    .fontSize(12)
                    .text(`Subsidio detalle ID: ${subsidioDetalle.IdSubsidioDetalle}`, { align: 'left' })
                    .text(`ID de Subsidio: ${subsidioDetalle.IdSubsidio}`, { align: 'left' })
                    .text(`ID de Beneficiario: ${subsidioDetalle.IdBeneficiario}`, { align: 'left' })
                    .text(`Importe: ${subsidioDetalle.Importe}`, { align: 'left' })
                    .text(`Estado: ${subsidioDetalle.Estado}`, { align: 'left' })
                    .text(`Tipo de Documento: ${subsidioDetalle.TipoDocumento}`, { align: 'left' })
                    .text(`Número de Documento: ${subsidioDetalle.NumeroDocumento}`, { align: 'left' })
                    .text(`Apellido: ${subsidioDetalle.Apellido}`, { align: 'left' })
                    .text(`Nombre: ${subsidioDetalle.Nombre}`, { align: 'left' })
                    .moveDown();
            });

            // Finaliza el documento PDF
            doc.end();
        });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
});

// Manejar la señal SIGINT (Ctrl+C) para cerrar la conexión a la base de datos antes de salir
// No necesitas cerrar la conexión aquí
process.on('SIGINT', () => {
    console.log('Cerrando conexión a la base de datos...');
    connection.end(() => {
        console.log('Conexión cerrada');
        process.exit(0); // Salir del proceso Node.js
    });
});
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = {
    connection: connection
};