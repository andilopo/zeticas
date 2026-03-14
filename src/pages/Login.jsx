import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = React.useState('admin@zeticas.com');
    const [password, setPassword] = React.useState('admin123');
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(true);

    const handleLogin = (e) => {
        if (e) e.preventDefault();
        // Admin credentials check
        if (email === 'admin@zeticas.com' && password === 'admin123') {
            login({ email, name: 'Administrador', role: 'admin' });
            navigate('/gestion');
        } else {
            alert('Credenciales incorrectas. Prueba con admin@zeticas.com / admin123');
        }
    };

    return (
        <div className="login-page botanical-bg" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="container" style={{ maxWidth: '450px' }}>
                <div className="salmon-box" style={{
                    padding: '3.5rem',
                    borderRadius: '4px',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 className="font-serif" style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Bienvenido</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Ingresa a tu cuenta Zeticas
                        </p>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Correo Electrónico / Usuario
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
                                <input
                                    type="text"
                                    placeholder="admin@zeticas.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '2px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Contraseña
                                </label>
                                <Link to="#" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', textDecoration: 'none' }}>
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3.5rem 1rem 3rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '2px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor="remember" style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.9 }}>
                                Recordar mi sesión
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogin}
                            className="btn"
                            style={{
                                background: '#fff',
                                color: 'var(--color-secondary)',
                                padding: '1.2rem',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <LogIn size={20} />
                            INICIAR SESIÓN
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                ¿Aún no tienes cuenta?
                            </p>
                            <button
                                type="button"
                                className="btn"
                                style={{
                                    border: '2px solid #fff',
                                    color: '#fff',
                                    padding: '0.8rem 2rem',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'transparent'
                                }}
                            >
                                <UserPlus size={18} />
                                REGISTRARSE
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
