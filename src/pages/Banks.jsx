import React, { useState } from 'react';
import { Landmark, Plus, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { supabase } from '../lib/supabase';

const Banks = () => {
    const { banks, setBanks } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'cta de ahorros',
        account_number: '',
        initial_balance: 0,
        balance: 0
    });

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setFormData(bank);
        } else {
            setEditingBank(null);
            setFormData({
                name: '',
                type: 'cta de ahorros',
                account_number: '',
                initial_balance: 0,
                balance: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBank(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const data = {
            ...formData,
            initial_balance: parseFloat(formData.initial_balance) || 0,
            balance: parseFloat(formData.balance) || 0
        };

        try {
            if (editingBank) {
                const { error } = await supabase
                    .from('banks')
                    .update(data)
                    .eq('id', editingBank.id);

                if (!error) {
                    setBanks(banks.map(b => b.id === editingBank.id ? { ...b, ...data } : b));
                }
            } else {
                const { data: newBank, error } = await supabase
                    .from('banks')
                    .insert([data])
                    .select();

                if (!error && newBank) {
                    setBanks([...banks, newBank[0]]);
                } else {
                    // Fallback for local state if Supabase table doesn't exist yet
                    setBanks([...banks, { ...data, id: Date.now() }]);
                }
            }
        } catch (err) {
            console.error("Error saving bank:", err);
            // Fallback for local
            if (editingBank) {
                setBanks(banks.map(b => b.id === editingBank.id ? { ...b, ...data } : b));
            } else {
                setBanks([...banks, { ...data, id: Date.now() }]);
            }
        }

        handleCloseModal();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar este banco?")) {
            return;
        }

        try {
            const { error } = await supabase.from('banks').delete().eq('id', id);
            if (!error) {
                setBanks(banks.filter(b => b.id !== id));
            }
        } catch (err) {
            setBanks(banks.filter(b => b.id !== id));
        }
    };

    return (
        <div className="banks-module">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Gestión de Bancos</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Administración de cuentas bancarias y balances.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn"
                    style={{ background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Nuevo Banco
                </button>
            </header>

            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#fafafa', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Banco</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Tipo</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>No. Cuenta</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Saldo Inicial</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Saldo Actual</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banks.map((bank) => (
                            <tr key={bank.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '1.2rem 1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{bank.name}</td>
                                <td style={{ padding: '1.2rem 1rem', textTransform: 'capitalize', color: '#64748b' }}>{bank.type}</td>
                                <td style={{ padding: '1.2rem 1rem', color: '#64748b' }}>{bank.account_number}</td>
                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right', color: '#64748b' }}>${(bank.initial_balance || 0).toLocaleString()}</td>
                                <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: 'bold', color: (bank.balance || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                                    ${(bank.balance || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button onClick={() => handleOpenModal(bank)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><Edit3 size={16} /></button>
                                        <button onClick={() => handleDelete(bank.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4d' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            {editingBank ? 'Editar Banco' : 'Nuevo Banco'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Nombre del Banco</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Tipo de Cuenta</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                    <option value="cta de ahorros">Cta de ahorros</option>
                                    <option value="cta corriente">Cta corriente</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Pasarela Digital">Pasarela Digital</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Número de Cuenta</label>
                                <input type="text" name="account_number" value={formData.account_number} onChange={handleInputChange} placeholder="No. 05700034565" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Saldo Inicial ($)</label>
                                        <input
                                            type="number"
                                            name="initial_balance"
                                            value={formData.initial_balance}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#334155' }}>Saldo Actual ($)</label>
                                        <input
                                            type="number"
                                            name="balance"
                                            value={formData.balance}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.3rem' }}>* Este saldo se actualizará automáticamente con ingresos y egresos.</p>
                            </div>
                            <button type="submit" className="btn" style={{ background: 'var(--color-primary)', color: '#fff', marginTop: '1rem', padding: '0.8rem' }}>
                                {editingBank ? 'Guardar Cambios' : 'Crear Banco'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banks;
