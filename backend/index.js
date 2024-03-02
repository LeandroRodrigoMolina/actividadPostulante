// Importar los módulos necesarios
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Importar el paquete CORS

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
        const sql = 'SELECT * FROM Beneficiarios WHERE IdBeneficiario = ?';
        connection.query(sql, [IdBeneficiario], (err, rows) => {
            if (err) {
                console.error('Error al verificar beneficiario existente:', err);
                reject(err);
            } else {
                resolve(rows.length > 0);
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
});

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