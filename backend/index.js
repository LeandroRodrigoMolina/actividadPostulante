require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.APP_PORT || 5000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos: ', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

app.use(express.json());
app.use(cors());

const verificarBeneficiarioExistente = async (IdBeneficiario) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Beneficiarios WHERE IdBeneficiario = ?';
        connection.query(sql, [IdBeneficiario], (err, rows) => {
            if (err) {
                console.error('Error al verificar beneficiario existente:', err);
                reject(err);
            } else {
                resolve(rows.length === 0);
            }
        });
    });
};

const verificarBeneficiarioAsociado = async (IdSubsidio, IdBeneficiario) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM SubsidiosDetalle WHERE IdSubsidio = ? AND IdBeneficiario = ?';
        connection.query(sql, [IdSubsidio, IdBeneficiario], (err, rows) => {
            if (err) {
                console.error('Error al verificar beneficiario asociado:', err);
                reject(err);
            } else {
                resolve(rows.length > 0);
            }
        });
    });
};

const verificarBeneficiarioEnOficinaYSubsidio = async (IdOficina, IdBeneficiario, Anio, Mes) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Subsidios WHERE IdOficina = ? AND Anio = ? AND Mes = ?';
        connection.query(sql, [IdOficina, Anio, Mes], async (err, subsidios) => {
            if (err) {
                console.error('Error al verificar beneficiario en oficina y subsidio:', err);
                reject(err);
            } else {
                try {
                    for (const subsidio of subsidios) {
                        const beneficiarioAsociado = await verificarBeneficiarioAsociado(subsidio.IdSubsidio, IdBeneficiario);
                        if (beneficiarioAsociado) {
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                } catch (error) {
                    console.error('Error al verificar beneficiario asociado:', error);
                    reject(error);
                }
            }
        });
    });
};

app.post('/subsidios-detalle/agregar', async (req, res) => {
    const { IdSubsidio, IdBeneficiario, Importe, Estado } = req.body;

    try {

        if (Importe > 1000000) {
            console.log("El importe supera el límite permitido", Importe > 1000000);
            return res.status(400).json({ message: 'El importe supera el límite permitido' });
        }

        const oficinaSubsidioExistente = await verificarBeneficiarioEnOficinaYSubsidio(IdSubsidio, IdBeneficiario, req.body.Anio, req.body.Mes);

        if (oficinaSubsidioExistente === true) {
            console.log("El beneficiario ya está asociado a un subsidio en la misma oficina y el mismo año/mes", oficinaSubsidioExistente);
            return res.status(409).json({ message: 'El beneficiario ya está asociado a un subsidio en la misma oficina y el mismo año/mes', IdBeneficiario });
        }

        const beneficiarioExistente = await verificarBeneficiarioExistente(IdBeneficiario);

        if (beneficiarioExistente === true) {
            console.log("El beneficiario no existe sin !", beneficiarioExistente);
            return res.status(404).json({ message: 'El beneficiario no existe', IdBeneficiario });
        }

        const beneficiarioAsociado = await verificarBeneficiarioAsociado(IdSubsidio, IdBeneficiario);

        if (beneficiarioAsociado === true) {
            console.log("El beneficiario ya está asociado a un subsidio de este tipo", beneficiarioAsociado);
            return res.status(404).json({ message: 'El beneficiario ya está asociado a un subsidio de este tipo', IdBeneficiario });
        }

        const sql = `INSERT INTO SubsidiosDetalle (IdSubsidio, IdBeneficiario, Importe, Estado) VALUES (?, ?, ?, ?)`;
        connection.query(sql, [IdSubsidio, IdBeneficiario, Importe, Estado], (err, result) => {
            if (err) {
                console.error('Error al agregar subsidio-detalle:', err);
                res.status(500).json({ message: 'Error al agregar subsidio-detalle' });
                return;
            }
            console.log('SubsidioForm-detalle agregado correctamente');

            const sqlBeneficiario = 'SELECT * FROM Beneficiarios WHERE IdBeneficiario = ?';
            connection.query(sqlBeneficiario, [IdBeneficiario], (err, beneficiarioResult) => {
                if (err) {
                    console.error('Error al obtener información del beneficiario:', err);
                    res.status(500).json({ message: 'Error al obtener información del beneficiario' });
                    return;
                }

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

app.get('/subsidios-detalle/pdf-ultimo', async (req, res) => {
    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=subsidio_detalle_ultimo.pdf');
        doc.pipe(res);

        const sql = `SELECT sd.IdSubsidioDetalle, sd.IdSubsidio, sd.IdBeneficiario, sd.Importe, sd.Estado,
                            b.TipoDocumento, b.NumeroDocumento, b.Apellido, b.Nombre
                     FROM SubsidiosDetalle sd
                     INNER JOIN Beneficiarios b ON sd.IdBeneficiario = b.IdBeneficiario
                     ORDER BY sd.IdSubsidioDetalle DESC
                     LIMIT 1`;

        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Error al obtener el último subsidio detalle:', err);
                res.status(500).json({ message: 'Error al obtener el último subsidio detalle' });
                return;
            }

            if (result.length > 0) {
                const subsidioDetalle = result[0];
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
            doc.end();
        });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
});

const generatePDF = (subsidioDetalle, res) => {
    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=subsidios_detalle.pdf');
        doc.pipe(res);

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

        doc.end();
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
};

app.post('/subsidios/registrar', (req, res) => {
    const { Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado } = req.body;

    const sql = `INSERT INTO Subsidios (Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado) VALUES (?, ?, ?, ?, ?, ?, false)`;
    connection.query(sql, [Descripcion, IdOficina, FechaDeAlta, Anio, Mes, Estado, Eliminado], (err, result) => {
        if (err) {
            console.error('Error al insertar subsidio:', err);
            res.status(500).json({ message: 'Error al insertar subsidio' });
            return;
        }
        console.log('SubsidioForm registrado correctamente');
        res.status(200).json({ message: 'SubsidioForm registrado correctamente' });
    });
});

app.post('/beneficiarios/crear', (req, res) => {
    const { IdBeneficiario, TipoDocumento, NumeroDocumento, Apellido, Nombre } = req.body;

    const sql = `INSERT INTO Beneficiarios (TipoDocumento, NumeroDocumento, Apellido, Nombre) VALUES (?, ?, ?, ?)`;
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

app.put('/subsidios/:id', (req, res) => {
    const subsidioId = req.params.id;

    const sql = `UPDATE Subsidios SET Eliminado = true, Estado = 'BA' WHERE IdSubsidio = ?`;
    connection.query(sql, [subsidioId], (err, result) => {
        if (err) {
            console.error('Error al eliminar subsidio:', err);
            res.status(500).json({ message: 'Error al eliminar subsidio' });
            return;
        }
        console.log('SubsidioForm eliminado correctamente');
        res.status(200).json({ message: 'SubsidioForm eliminado correctamente' });
    });
});

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

app.delete('/subsidios-detalle/:id', (req, res) => {
    const subsidioDetalleId = req.params.id;
    //Para eliminarlo cambia el estado a BA (baja)
    const sql = `UPDATE SubsidiosDetalle SET Estado = 'BA' WHERE IdSubsidioDetalle = ?`;
    connection.query(sql, [subsidioDetalleId], (err, result) => {
        if (err) {
            console.error('Error al eliminar subsidio-detalle:', err);
            res.status(500).json({ message: 'Error al eliminar subsidio-detalle' });
            return;
        }
        console.log('SubsidioForm-detalle eliminado correctamente');
        res.status(200).json({ message: 'SubsidioForm-detalle eliminado correctamente' });
    });
});

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

app.get('/subsidios/beneficiario/:id', async (req, res) => {
    const beneficiarioId = req.params.id;

    try {
        const sql = `
            SELECT s.*
            FROM Subsidios s
            INNER JOIN SubsidiosDetalle sd ON s.IdSubsidio = sd.IdSubsidio
            WHERE sd.IdBeneficiario = ?
        `;

        connection.query(sql, [beneficiarioId], (err, results) => {
            if (err) {
                console.error('Error al obtener los subsidios para el beneficiario:', err);
                res.status(500).json({ message: 'Error al obtener los subsidios para el beneficiario' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error al listar los subsidios para el beneficiario:', error);
        res.status(500).json({ message: 'Error al listar los subsidios para el beneficiario' });
    }
});

app.get('/subsidios/oficina/:idOficina/:fechaInicio/:fechaFin', async (req, res) => {
    const idOficina = req.params.idOficina;
    const fechaInicio = req.params.fechaInicio;
    const fechaFin = req.params.fechaFin;

    try {
        const sql = `
            SELECT s.*
            FROM Subsidios s
            INNER JOIN SubsidiosDetalle sd ON s.IdSubsidio = sd.IdSubsidio
            WHERE s.FechaDeAlta BETWEEN ? AND ?
            AND s.IdOficina = ?
        `;

        connection.query(sql, [fechaInicio, fechaFin, idOficina], (err, results) => {
            if (err) {
                console.error('Error al obtener los subsidios para la oficina en el rango de fechas:', err);
                res.status(500).json({ message: 'Error al obtener los subsidios para la oficina en el rango de fechas' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error al listar los subsidios para la oficina en el rango de fechas:', error);
        res.status(500).json({ message: 'Error al listar los subsidios para la oficina en el rango de fechas' });
    }
});

process.on('SIGINT', () => {
    console.log('Cerrando conexión a la base de datos...');
    connection.end(() => {
        console.log('Conexión cerrada');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = {
    connection: connection
};
