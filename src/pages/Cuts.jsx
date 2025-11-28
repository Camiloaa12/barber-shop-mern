import { useState } from 'react';
import api from '../api/axios';

const Cuts = () => {
    const [formData, setFormData] = useState({
        client: '', barber: '', price: '', payment: 'efectivo', description: ''
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cuts', { ...formData, price: Number(formData.price) });
            setMessage('Corte registrado con éxito');
            setFormData({ client: '', barber: '', price: '', payment: 'efectivo', description: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error al registrar corte');
        }
    };

    return (
        <div className="container">
            <section className="panel">
                <h2 className="panel-title">Registrar Corte</h2>
                <form onSubmit={handleSubmit} className="grid grid-3">
                    <div>
                        <label>Cliente</label>
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
                        <label>Precio</label>
                        <input
                            type="number" step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Pago</label>
                        <select
                            value={formData.payment}
                            onChange={e => setFormData({ ...formData, payment: e.target.value })}
                        >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div>
                        <label>Descripción</label>
                        <input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="primary" style={{ width: '100%' }}>Registrar corte</button>
                    </div>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
            </section>
        </div>
    );
};

export default Cuts;
