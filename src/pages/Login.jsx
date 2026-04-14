import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const deepTeal = "#025357";
const institutionOcre = "#D6BD98";
const lightSage = "#f8f9f5";

const Login = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle, resetPassword } = useAuth();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(true);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        try {
            await login(email, password);
            navigate('/gestion');
        } catch (err) {
            console.error("Mock Login Error:", err);
            alert('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            navigate('/gestion');
        } catch (err) {
            console.error("Google Login Error:", err);
            alert(err.message || 'Error al ingresar con Google.');
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            alert('Por favor, ingresa tu correo electrónico primero para enviarte el enlace de recuperación.');
            return;
        }
        try {
            await resetPassword(email);
            alert('Se ha enviado un correo de recuperación a ' + email + '. Por favor revisa tu bandeja de entrada.');
        } catch (err) {
            console.error("Reset Password Error:", err);
            alert('Error al enviar el correo de recuperación. Verifica que el correo sea correcto.');
        }
    };

    return (
        <div className="login-page botanical-bg" style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            background: lightSage,
            position: 'relative'
        }}>
            {/* Soft decorative elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: 'rgba(214, 189, 152, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '5%',
                width: '250px',
                height: '250px',
                background: 'rgba(2, 83, 87, 0.05)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }}></div>

            <div className="container" style={{ maxWidth: '500px', zIndex: 1 }}>
                <div style={{
                    background: '#fff',
                    padding: '4rem',
                    borderRadius: '40px',
                    boxShadow: '0 40px 100px rgba(2, 83, 87, 0.08)',
                    border: '1px solid rgba(2, 83, 87, 0.03)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '6px',
                        background: `linear-gradient(90deg, ${deepTeal}, ${institutionOcre})`
                    }}></div>

                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <div style={{ 
                            width: '60px', height: '60px', background: 'rgba(2, 83, 87, 0.05)', 
                            borderRadius: '20px', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', margin: '0 auto 1.5rem', color: deepTeal
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="font-serif" style={{ color: deepTeal, fontSize: '3rem', marginBottom: '0.8rem', lineHeight: '1.2' }}>Bienvenido</h1>
                        <p style={{ color: '#666', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700' }}>
                            Acceso Privado Zeticas
                        </p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <label style={{ color: deepTeal, fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Usuario / Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                <input
                                    type="text"
                                    placeholder="usuario@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                                        background: '#fcfcfc',
                                        border: '1px solid #eee',
                                        borderRadius: '16px',
                                        color: '#333',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = `1px solid ${institutionOcre}`;
                                        e.target.style.boxShadow = `0 4px 20px rgba(214, 189, 152, 0.15)`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid #eee';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ color: deepTeal, fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Contraseña
                                </label>
                                <button 
                                    type="button"
                                    onClick={handleResetPassword}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: institutionOcre, fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem 4rem 1.2rem 3.5rem',
                                        background: '#fcfcfc',
                                        border: '1px solid #eee',
                                        borderRadius: '16px',
                                        color: '#333',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = `1px solid ${institutionOcre}`;
                                        e.target.style.boxShadow = `0 4px 20px rgba(214, 189, 152, 0.15)`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid #eee';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1.2rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#aaa',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{ 
                                    width: '18px', height: '18px', 
                                    cursor: 'pointer', 
                                    accentColor: deepTeal 
                                }}
                            />
                            <label htmlFor="remember" style={{ color: '#666', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                Mantener sesión abierta
                            </label>
                        </div>

                        <button
                            type="submit"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                background: isHovered ? '#014346' : deepTeal,
                                color: '#fff',
                                padding: '1.4rem',
                                borderRadius: '16px',
                                border: 'none',
                                fontWeight: '900',
                                fontSize: '1rem',
                                letterSpacing: '2px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isHovered ? '0 15px 30px rgba(2, 83, 87, 0.25)' : '0 10px 20px rgba(2, 83, 87, 0.15)',
                                transform: isHovered ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            <LogIn size={20} />
                            INGRESAR
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    color: '#475569',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '50px',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.8rem',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    width: '100%'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                                    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                                    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                                    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                                </svg>
                                INGRESAR CON GOOGLE
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
