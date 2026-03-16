import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    Star,
    MessageSquare,
    X,
    Save,
    Phone,
    Mail,
    MapPin,
    Building2,
    User,
    ShieldCheck,
    Download,
    Upload,
    Edit2,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useBusiness } from '../context/BusinessContext';
import { supabase } from '../lib/supabase';

const Clients = () => {
    const { orders, clients, setClients, refreshData } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [duplicatesModal, setDuplicatesModal] = useState({ isOpen: false, newClients: [], duplicatedClients: [] });

    const [newClient, setNewClient] = useState({
        name: '',
        idType: 'NIT',
        nit: '',
        email: '',
        phone: '',
        address: '',
        location: '',
        source: 'Web',
        contactName: '',
        type: 'Jurídica'
    });

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length > 0) {
                const mappedClients = data.map((row) => {
                    const getValue = (searchTerms) => {
                        const keys = Object.keys(row);
                        for (let term of searchTerms) {
                            const foundKey = keys.find(k => k.trim().toLowerCase().includes(term.toLowerCase()));
                            if (foundKey && row[foundKey] !== undefined) return row[foundKey];
                        }
                        return null;
                    };

                    const typeStr = getValue(["tipo cliente", "b2b/b2c"]) || "B2B";
                    const isB2B = String(typeStr).toUpperCase().includes("B2B");

                    return {
                        name: getValue(["nombre o razón", "razón social", "razon social", "nombre", "cliente"]) || "Sin Nombre",
                        nit: String(getValue(["número de identifi", "numero de identifi", "nit", "documento"]) || ""),
                        source: getValue(["fuente pedido", "fuente"]) || "Web",
                        address: getValue(["dirección", "direccion"]) || "",
                        phone: String(getValue(["teléfono", "telefono", "celular"]) || ""),
                        email: getValue(["correo", "email"]) || "",
                        type: isB2B ? 'Jurídica' : 'Natural',
                        status: 'ACTIVE'
                    };
                });

                const existingNits = new Set(clients.map(c => c.nit));
                const uniqueNewClients = [];
                const duplicateClientsUpload = [];

                mappedClients.forEach(nc => {
                    if (nc.nit && existingNits.has(nc.nit)) {
                        duplicateClientsUpload.push(nc);
                    } else {
                        uniqueNewClients.push(nc);
                    }
                });

                if (duplicateClientsUpload.length > 0) {
                    setDuplicatesModal({ isOpen: true, newClients: uniqueNewClients, duplicatedClients: duplicateClientsUpload });
                } else {
                    await persistClients(uniqueNewClients);
                }
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const persistClients = async (clientList) => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('clients').insert(clientList);
            if (error) throw error;
            await refreshData();
            alert("Sincronización con base de datos exitosa");
        } catch (err) {
            console.error("Error persisting clients:", err);
            alert("Error al guardar en la base de datos");
        } finally {
            setIsSaving(false);
            setDuplicatesModal({ isOpen: false, newClients: [], duplicatedClients: [] });
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nit?.includes(searchTerm)
    );

    const handleSaveClient = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase.from('clients').insert([{
                name: newClient.name,
                nit: newClient.nit,
                email: newClient.email,
                phone: newClient.phone,
                address: newClient.address,
                type: newClient.type,
                source: newClient.source,
                status: 'ACTIVE'
            }]);
            if (error) throw error;

            await refreshData();
            setIsModalOpen(false);
            setNewClient({
                name: '', idType: 'NIT', nit: '', email: '', phone: '',
                address: '', location: '', source: 'Web',
                contactName: '', type: 'Jurídica'
            });
        } catch (err) {
            console.error("Error saving client:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        const newStatus = client.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await supabase.from('clients').update({ status: newStatus }).eq('id', clientId);
            await refreshData();
            if (selectedClient && selectedClient.id === clientId) {
                setSelectedClient({ ...selectedClient, status: newStatus });
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar este cliente permanentemente de la base de datos?")) {
            return;
        }

        const hasOrders = orders.some(o => o.client_id === clientId || o.client === clients.find(c => c.id === clientId)?.name);

        if (hasOrders) {
            alert("Tiene pedidos asociados, ¡solo lo puede Inactivar!");
            return;
        }

        try {
            await supabase.from('clients').delete().eq('id', clientId);
            await refreshData();
            setSelectedClient(null);
        } catch (err) {
            console.error("Error deleting client:", err);
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedClient) return;
        setIsSaving(true);
        try {
            await supabase.from('clients').update({
                name: selectedClient.name,
                nit: selectedClient.nit,
                email: selectedClient.email,
                phone: selectedClient.phone,
                address: selectedClient.address,
                type: selectedClient.type,
                source: selectedClient.source
            }).eq('id', selectedClient.id);

            await refreshData();
            setIsEditingProfile(false);
            alert("Cambios sincronizados con la nube");
        } catch (err) {
            console.error("Error updating client:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangeEditedClient = (field, value) => {
        if (!selectedClient) return;
        setSelectedClient({ ...selectedClient, [field]: value });
    };

    return (
        <div className="clients-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Gestión de Clientes (En Línea)</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Directorio centralizado sincronizado con la nube.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar en la nube..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>

                    <label style={{
                        background: '#f1f5f9', color: '#475569', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0
                    }} title="Cargue Masivo">
                        <Upload size={18} /> Importar Excel
                        <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} style={{ display: 'none' }} />
                    </label>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium"
                        style={{
                            background: 'var(--color-secondary)',
                            color: '#fff',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: '0 4px 12px rgba(219, 149, 122, 0.2)'
                        }}
                    >
                        <UserPlus size={18} /> + Nuevo Cliente
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {filteredClients.map(c => (
                    <div key={c.id} style={{
                        background: '#fff',
                        padding: '1.8rem',
                        borderRadius: '24px',
                        border: '1px solid #f1f5f9',
                        position: 'relative',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s ease',
                        opacity: c.status === 'Inactive' ? 0.6 : 1
                    }} className="client-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                            <div style={{
                                background: c.subType === 'B2B' ? '#f0f9ff' : '#fdf2f8',
                                color: c.subType === 'B2B' ? '#0369a1' : '#be185d',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}>
                                {c.subType === 'B2B' ? <Briefcase size={12} /> : <User size={12} />}
                                {c.subType}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    background: c.status === 'Inactive' ? '#f1f5f9' : '#dcfce7',
                                    color: c.status === 'Inactive' ? '#64748b' : '#166534'
                                }}>
                                    {c.status === 'Inactive' ? 'Inactivo' : 'Activo'}
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.4rem' }}>{c.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                            <MapPin size={14} /> {c.location || 'Consultar Dirección'}
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button
                                onClick={() => setSelectedClient(c)}
                                style={{ flex: 1, padding: '0.7rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={16} /> Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Profile Modal */}
            {selectedClient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0 }}>Perfil de Cliente</h3>
                            <button onClick={() => setSelectedClient(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>NOMBRE</label>
                                <input type="text" value={selectedClient.name} onChange={(e) => handleChangeEditedClient('name', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>NIT</label>
                                <input type="text" value={selectedClient.nit} onChange={(e) => handleChangeEditedClient('nit', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>TIPO</label>
                                <select value={selectedClient.type} onChange={(e) => handleChangeEditedClient('type', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                                    <option value="Jurídica">Jurídica</option>
                                    <option value="Natural">Natural</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleDeleteClient(selectedClient.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                            <button onClick={() => handleToggleStatus(selectedClient.id)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                {selectedClient.status === 'Active' ? 'Inactivar' : 'Activar'}
                            </button>
                            <button onClick={handleSaveChanges} disabled={isSaving} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.5rem 2rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Client Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Nuevo Cliente</h3>
                        <form onSubmit={handleSaveClient}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input placeholder="Nombre / Empresa" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                                <input placeholder="NIT" required value={newClient.nit} onChange={(e) => setNewClient({ ...newClient, nit: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                                <input placeholder="Email" required value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                                <button type="submit" disabled={isSaving} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
                                    {isSaving ? 'Registrando...' : 'Registrar Cliente'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
