import { useState, useEffect } from 'react';
import api from '../api/axios';

const Admin = () => {
    const [stats, setStats] = useState({ daily: 0, monthly: 0, clients: 0 });
    const [users, setUsers] = useState([]);

    const fetchData = async () => {
        try {
            const [dailyRes, monthlyRes, usersRes] = await Promise.all([
                api.get('/stats/daily'),
                api.get('/stats/monthly'),
                api.get('/admin/barberos')
            ]);

            setStats({
                daily: dailyRes.data.total || 0,
                monthly: monthlyRes.data.total || 0,
                clients: 0 // Backend doesn't provide this yet, placeholder
            });
            setUsers(usersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container">
            <h2 className="panel-title">Panel Administrativo</h2>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="stat-box panel" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Reservas hoy</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.daily}</div>
                </div>
                <div className="stat-box panel" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Ingresos mes</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.monthly}</div>
                </div>
                <div className="stat-box panel" style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Clientes</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>-</div>
                </div>
            </div>

            <button onClick={fetchData} className="secondary" style={{ marginBottom: '1rem' }}>Actualizar estadísticas</button>

            <section className="panel">
                <h3 className="panel-title">Usuarios Registrados</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default Admin;
