import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SubsidioForm() {
    const [descripcion, setDescripcion] = useState('');
    const [idOficina, setIdOficina] = useState('');
    const [fechaDeAlta, setFechaDeAlta] = useState('');
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [estado, setEstado] = useState('AC');
    const [oficinas, setOficinas] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/oficinas')
            .then(response => {
                setOficinas(response.data);
            })
            .catch(error => {
                console.error('Error al obtener las oficinas:', error);
            });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/subsidios/registrar', {
                Descripcion: descripcion,
                IdOficina: idOficina,
                FechaDeAlta: fechaDeAlta,
                Anio: anio,
                Mes: mes,
                Estado: estado,
                Eliminado: false
            });
            console.log(response.data.message);
        } catch (error) {
            console.error('Error al registrar subsidio:', error);
        }
    };

    const handleAnioChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setAnio(value.toString());
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Agregar Nuevo Subsidio</h2>
            <div>
                <label htmlFor="descripcion">Descripción:</label>
                <input type="text" id="descripcion" value={descripcion}
                       onChange={(e) => setDescripcion(e.target.value)} placeholder="Ingrese la descripción"/>
            </div>
            <div>
                <label htmlFor="idOficina">ID de Oficina:</label>
                <select id="idOficina" value={idOficina} onChange={(e) => setIdOficina(e.target.value)}>
                    <option value="">Seleccionar Oficina</option>
                    {oficinas.map(oficina => (
                        <option key={oficina.IdOficina} value={oficina.IdOficina}>{oficina.Descripcion}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="fechaDeAlta">Fecha de Alta:</label>
                <input type="date" id="fechaDeAlta" value={fechaDeAlta}
                       onChange={(e) => setFechaDeAlta(e.target.value)} placeholder="Seleccione la fecha de alta"/>
            </div>
            <div>
                <label htmlFor="anio">Año:</label>
                <input type="number" id="anio" value={anio} onChange={handleAnioChange} placeholder="Ingrese el año"/>
            </div>
            <div>
                <label htmlFor="mes">Mes:</label>
                <input type="text" id="mes" value={mes} onChange={(e) => setMes(e.target.value)}
                       placeholder="Ingrese el mes"/>
            </div>
            <div>
                <label htmlFor="estado">Estado:</label>
                <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <option value="AC">AC</option>
                    <option value="BA">BA</option>
                </select>
            </div>
            <button type="submit">Registrar Subsidio</button>
        </form>
    );
}

export default SubsidioForm;
