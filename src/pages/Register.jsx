import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(formData.username, formData.email, formData.password);
            setSuccess('Registro exitoso! Redirigiendo...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error en el registro');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="panel-title">Registro Nuevo Barbero</h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>{success}</div>}
                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label>Nombre de Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Juan Perez"
                            required
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="juan@correo.com"
                            required
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }}>Registrar</button>
                        <Link to="/login" style={{ flex: 1 }}>
                            <button type="button" className="secondary" style={{ width: '100%' }}>Volver</button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
