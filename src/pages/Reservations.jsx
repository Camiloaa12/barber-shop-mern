import { useState, useEffect } from 'react';
import api from '../api/axios';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [formData, setFormData] = useState({
        client: '', barber: '', date: '', time: '', service: 'corte'
    });
    const [message, setMessage] = useState('');

    const fetchReservations = async () => {
        try {
            const res = await api.get('/appointments');
            setReservations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', formData);
            setMessage('Reserva creada con éxito');
            fetchReservations();
            setFormData({ client: '', barber: '', date: '', time: '', service: 'corte' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error al crear reserva');
        }
    };

    return (
        <div className="container">
            <section className="panel">
                <h2 className="panel-title">Gestión de Reservas</h2>
                <form onSubmit={handleSubmit} className="grid grid-3">
                    <div>
                        <label>Nombre cliente</label>
                        <input
                            value={formData.client}
                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Barbero</label>
                        <input
                            value={formData.barber}
                            onChange={e => setFormData({ ...formData, barber: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Hora</label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Servicio</label>
                        <select
                            value={formData.service}
                            onChange={e => setFormData({ ...formData, service: e.target.value })}
                        >
                            <option value="corte">Corte</option>
                            <option value="barba">Barba</option>
                            <option value="color">Color</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="primary" style={{ width: '100%' }}>Crear reserva</button>
                    </div>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
            </section>

            <section className="panel">
                <h2 className="panel-title">Listado de Reservas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Barbero</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map((r, i) => (
                            <tr key={i}>
                                <td>{r.client}</td>
                                <td>{r.date}</td>
                                <td>{r.time}</td>
                                <td>{r.barber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default Reservations;
