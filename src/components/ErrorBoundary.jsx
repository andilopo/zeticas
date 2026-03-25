import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    backgroundColor: '#fef2f2',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                    <h1 style={{ color: '#991b1b', fontSize: '2rem', margin: '0 0 1rem', fontWeight: 900 }}>¡Ups! Algo salió mal.</h1>
                    <p style={{ color: '#7f1d1d', maxWidth: '500px', margin: '0 0 2rem', lineHeight: 1.6 }}>
                        Ocurrió un error inesperado al cargar esta pantalla o componente. 
                        No te preocupes, el resto de la aplicación funciona correctamente.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.8rem 1.7rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        Volver a cargar la página
                    </button>
                    {import.meta.env.DEV && (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '0.8rem', textAlign: 'left', maxWidth: '800px', overflowX: 'auto' }}>
                            <pre>{this.state.error?.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
