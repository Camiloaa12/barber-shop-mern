import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Scissors, Calendar, Shield, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                <h1>SoftBarber</h1>
                <nav>
                    <Link to="/">
                        <button><Calendar size={18} /> Reservas</button>
                    </Link>
                    <Link to="/cortes">
                        <button><Scissors size={18} /> Cortes</button>
                    </Link>

                    {user.role === 'admin' && (
                        <Link to="/admin">
                            <button><Shield size={18} /> Admin</button>
                        </Link>
                    )}

                    <button onClick={handleLogout} className="danger">
                        <LogOut size={18} /> Salir
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
