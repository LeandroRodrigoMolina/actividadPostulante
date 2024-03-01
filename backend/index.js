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


// Manejar la señal SIGINT (Ctrl+C) para cerrar la conexión a la base de datos antes de salir
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
