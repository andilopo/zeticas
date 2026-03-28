import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurar sesión persistente para una experiencia fluida
        const savedUser = localStorage.getItem('zeticas_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Error al restaurar sesión:", e);
                localStorage.removeItem('zeticas_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Opción 1: Backdoor de Emergencia / Administrador del Sistema
        if (email === 'admin@zeticas.com' && password === 'admin123') {
            const systemAdmin = { 
                name: 'Zeticas Admin', 
                role: 'super_admin', 
                email: 'admin@zeticas.com',
                permissions: { all: true }
            };
            setUser(systemAdmin);
            localStorage.setItem('zeticas_user', JSON.stringify(systemAdmin));
            return { success: true };
        }

        try {
            // Opción 2: Autenticación Ligera contra Firestore
            // Buscamos el documento del usuario por su correo y que esté activo
            const q = query(
                collection(db, 'users'), 
                where('email', '==', email.toLowerCase()),
                where('status', '==', 'Active')
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                // Verificación de contraseña asignada por el Admin
                if (userData.password === password) {
                    const authenticatedUser = { id: snapshot.docs[0].id, ...userData };
                    setUser(authenticatedUser);
                    localStorage.setItem('zeticas_user', JSON.stringify(authenticatedUser));
                    return { success: true };
                } else {
                    throw new Error("La contraseña ingresada es incorrecta.");
                }
            } else {
                throw new Error("Usuario no encontrado o cuenta inactiva.");
            }
        } catch (error) {
            console.error("Error en proceso de login:", error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        // Desactivado temporalmente a favor de la gestión interna de usuarios
        throw new Error("El acceso con Google no está habilitado actualmente.");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('zeticas_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
