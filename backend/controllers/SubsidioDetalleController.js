// Controlador para agregar un nuevo subsidio-detalle
const agregarSubsidioDetalle = async (req, res) => {
    try {
        const { IdSubsidio, IdBeneficiario, Importe, Estado } = req.body;

        // Verificar si el beneficiario ya existe en la base de datos
        const beneficiarioExistente = await verificarBeneficiarioExistente(IdBeneficiario);

        // Si el beneficiario no existe, crear un nuevo beneficiario
        if (!beneficiarioExistente) {
            await crearNuevoBeneficiario(IdBeneficiario);
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

// Función para crear un nuevo beneficiario en la base de datos
const crearNuevoBeneficiario = async (IdBeneficiario) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Beneficiarios (IdBeneficiario) VALUES (?)';
        connection.query(sql, [IdBeneficiario], (err, result) => {
            if (err) {
                console.error('Error al crear nuevo beneficiario:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
