import React, { useState, useEffect } from 'react';
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
    CheckCircle2,
    ShieldCheck,
    Briefcase,
    Download,
    Upload,
    Edit2,
    Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useBusiness } from '../context/BusinessContext';

const Clients = () => {
    const { orders } = useBusiness();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [duplicatesModal, setDuplicatesModal] = useState({ isOpen: false, newClients: [], duplicatedClients: [] });

    // Cargar datos persistentes del disco (Navegador) o vacíos
    const [clients, setClients] = useState(() => {
        const savedClients = localStorage.getItem('zeticas_clients_data');
        return savedClients ? JSON.parse(savedClients) : [];
    });

    // Guardar al disco cualquier cambio que sufra la base de clientes de este componente
    useEffect(() => {
        localStorage.setItem('zeticas_clients_data', JSON.stringify(clients));
    }, [clients]);

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
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length > 0) {
                const newClients = data.map((row, index) => {
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
                        id: Date.now() + index,
                        name: getValue(["nombre o razón", "razón social", "razon social", "nombre", "cliente"]) || "Sin Nombre",
                        idType: getValue(["tipo de identifi", "tipo doc"]) || "NIT",
                        nit: String(getValue(["número de identifi", "numero de identifi", "nit", "documento"]) || ""),
                        source: getValue(["fuente pedido", "fuente"]) || "Web",
                        address: getValue(["dirección", "direccion"]) || "",
                        location: getValue(["ciudad", "municipio"]) || "",
                        phone: String(getValue(["teléfono", "telefono", "celular"]) || ""),
                        email: getValue(["correo", "email"]) || "",
                        contactName: getValue(["nombre contacto", "contacto"]) || "",
                        type: isB2B ? 'Jurídica' : 'Natural',
                        subType: isB2B ? 'B2B' : 'B2C',
                        balance: 0,
                        status: 'Active'
                    };
                });

                const existingNits = new Set(clients.map(c => c.nit));
                const uniqueNewClients = [];
                const duplicateClientsUpload = [];

                newClients.forEach(nc => {
                    if (nc.nit && existingNits.has(nc.nit)) {
                        duplicateClientsUpload.push(nc);
                    } else {
                        uniqueNewClients.push(nc);
                    }
                });

                if (duplicateClientsUpload.length > 0) {
                    setDuplicatesModal({ isOpen: true, newClients: uniqueNewClients, duplicatedClients: duplicateClientsUpload });
                } else {
                    setClients(prev => [...uniqueNewClients, ...prev]);
                    setTimeout(() => alert("Su cargue masivo fue exitoso"), 100);
                }
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null; // Reset file input
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nit?.includes(searchTerm)
    );

    const handleSaveClient = (e) => {
        e.preventDefault();
        const subType = newClient.type === 'Jurídica' ? 'B2B' : 'B2C';
        const clientToAdd = {
            ...newClient,
            id: clients.length + 1,
            subType,
            balance: 0,
            status: 'Active'
        };
        setClients([clientToAdd, ...clients]);
        setIsModalOpen(false);
        setNewClient({
            name: '', idType: 'NIT', nit: '', email: '', phone: '',
            address: '', location: '', source: 'Web',
            contactName: '', type: 'Jurídica'
        });
    };

    const handleToggleStatus = (clientId) => {
        setClients(clients.map(client => {
            if (client.id === clientId) {
                const newStatus = client.status === 'Active' ? 'Inactive' : 'Active';
                // If updating the currently viewed client, also update selectedClient state
                if (selectedClient && selectedClient.id === clientId) {
                    setSelectedClient({ ...client, status: newStatus });
                }
                return { ...client, status: newStatus };
            }
            return client;
        }));
    };

    const handleDeleteClient = (clientId) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar este cliente?")) {
            return;
        }

        const clientToDelete = clients.find(c => c.id === clientId);
        if (!clientToDelete) return;

        // Check if there are any orders associated with this client's name or NIT
        const hasOrders = orders.some(o =>
            o.client.toLowerCase() === clientToDelete.name.toLowerCase()
        );

        if (hasOrders) {
            alert("Tiene pedidos asociados, ¡solo lo puede Inactivar!");
            return;
        }

        setClients(clients.filter(c => c.id !== clientId));
        setSelectedClient(null);
    };

    const handleConfirmReplace = () => {
        setClients(prev => {
            let updatedClients = [...prev];
            duplicatesModal.duplicatedClients.forEach(dup => {
                const index = updatedClients.findIndex(c => c.nit === dup.nit);
                if (index !== -1) {
                    updatedClients[index] = { ...dup, id: updatedClients[index].id, balance: updatedClients[index].balance, status: updatedClients[index].status };
                }
            });
            return [...duplicatesModal.newClients, ...updatedClients];
        });
        setDuplicatesModal({ isOpen: false, newClients: [], duplicatedClients: [] });
        setTimeout(() => alert("Su cargue masivo fue exitoso"), 150);
    };

    const handleIgnoreDuplicates = () => {
        setClients(prev => [...duplicatesModal.newClients, ...prev]);
        setDuplicatesModal({ isOpen: false, newClients: [], duplicatedClients: [] });
        setTimeout(() => alert("Su cargue masivo fue exitoso"), 150);
    };

    const handleChangeEditedClient = (field, value) => {
        if (!selectedClient) return;
        setSelectedClient({ ...selectedClient, [field]: value });
    };

    const handleSaveChanges = () => {
        if (!selectedClient) return;
        setClients(clients.map(c => c.id === selectedClient.id ? selectedClient : c));
        setIsEditingProfile(false);
        setTimeout(() => alert("Cambios guardados con éxito"), 150);
    };

    return (
        <div className="clients-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Gestión de Clientes</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Directorio B2B/B2C y control de cartera comercial.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o NIT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <a
                        href="/plantilla_cargue_masivo_clientes_zeticas.xlsx?download=true"
                        download="plantilla_cargue_masivo_clientes_zeticas.xlsx"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            background: '#f1f5f9', color: '#475569', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                            fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none'
                        }}
                        title="Descargar Plantilla"
                    >
                        <Download size={18} /> Plantilla
                    </a>

                    <label style={{
                        background: '#f1f5f9', color: '#475569', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0
                    }} title="Cargue Masivo">
                        <Upload size={18} /> Cargue
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
                        <UserPlus size={18} /> + Nuevo Registro
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
                                {c.type === 'Jurídica' && <Star size={18} fill="#FFD700" color="#FFD700" style={{ opacity: 0.8 }} />}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.4rem' }}>{c.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                            <MapPin size={14} /> {c.location || 'Consultar Dirección'}
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>Saldo en Cartera</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: c.balance > 0 ? '#ef4444' : '#10b981' }}>
                                ${c.balance.toLocaleString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button
                                onClick={() => setSelectedClient(c)}
                                style={{ flex: 1, padding: '0.7rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={16} /> Ver Perfil
                            </button>
                            <button style={{ padding: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', cursor: 'pointer', color: '#64748b' }}>
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for New Client */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '550px',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)' }}>Registro de Nuevo Cliente</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Completa los datos para habilitar el canal de ventas.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} color="#64748b" /></button>
                        </div>

                        <form onSubmit={handleSaveClient} style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, type: 'Jurídica' })}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer',
                                            background: newClient.type === 'Jurídica' ? '#fff' : 'transparent',
                                            color: newClient.type === 'Jurídica' ? '#0369a1' : '#64748b',
                                            boxShadow: newClient.type === 'Jurídica' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <Building2 size={14} /> Persona Jurídica (B2B)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, type: 'Natural' })}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer',
                                            background: newClient.type === 'Natural' ? '#fff' : 'transparent',
                                            color: newClient.type === 'Natural' ? '#be185d' : '#64748b',
                                            boxShadow: newClient.type === 'Natural' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <User size={14} /> Persona Natural (B2C)
                                    </button>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>NOMBRE / RAZÓN SOCIAL</label>
                                    <input
                                        type="text"
                                        required
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>TIPO DOC</label>
                                        <select
                                            value={newClient.idType}
                                            onChange={(e) => setNewClient({ ...newClient, idType: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
                                        >
                                            <option value="NIT">NIT</option>
                                            <option value="CC">CC</option>
                                            <option value="CE">CE</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>NÚMERO DE IDENTIFICACIÓN</label>
                                        <input
                                            type="text"
                                            required
                                            value={newClient.nit}
                                            onChange={(e) => setNewClient({ ...newClient, nit: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>FUENTE DE PEDIDO</label>
                                        <select
                                            value={newClient.source}
                                            onChange={(e) => setNewClient({ ...newClient, source: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}
                                        >
                                            <option value="Web">Web</option>
                                            <option value="Recurrente">Recurrente</option>
                                            <option value="Distribuidor">Distribuidor</option>
                                            <option value="Cliente">Cliente</option>
                                            <option value="BOT">BOT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>CORREO ELECTRÓNICO</label>
                                        <input
                                            type="email"
                                            required
                                            value={newClient.email}
                                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}> TELÉFONO</label>
                                        <input
                                            type="text"
                                            required
                                            value={newClient.phone}
                                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}> CIUDAD</label>
                                        <input
                                            type="text"
                                            required
                                            value={newClient.location}
                                            onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>NOMBRE DE CONTACTO</label>
                                        <input
                                            type="text"
                                            value={newClient.contactName}
                                            onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>DIRECCIÓN FÍSICA</label>
                                    <textarea
                                        rows="2"
                                        value={newClient.address}
                                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem',
                                        boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)'
                                    }}
                                >
                                    <Save size={18} /> Registrar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Duplicates View */}
            {duplicatesModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2600,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden',
                        padding: '2.5rem'
                    }}>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', color: 'var(--color-primary)' }}>⚠️ Clientes Repetidos</h3>
                        <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Se han encontrado <strong>{duplicatesModal.duplicatedClients.length}</strong> clientes en el archivo que ya existen en tu directorio (identificados por NIT). <br /><br />¿Deseas actualizar y reemplazar la información de esos clientes con los datos del nuevo Excel?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                            <button
                                onClick={handleIgnoreDuplicates}
                                style={{
                                    flex: 1, background: '#f1f5f9', color: '#475569', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                Ignorar repetidos
                            </button>
                            <button
                                onClick={handleConfirmReplace}
                                style={{
                                    flex: 1, background: 'var(--color-primary)', color: '#fff', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)'
                                }}
                            >
                                Sí, Reemplazar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Client Profile View */}
            {selectedClient && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '600px',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{selectedClient.name}</h3>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: selectedClient.status === 'Inactive' ? '#f1f5f9' : '#dcfce7',
                                        color: selectedClient.status === 'Inactive' ? '#64748b' : '#166534'
                                    }}>
                                        {selectedClient.status === 'Inactive' ? 'Inactivo' : 'Activo'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    {isEditingProfile ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <select
                                                    value={selectedClient.idType || 'NIT'}
                                                    onChange={(e) => handleChangeEditedClient('idType', e.target.value)}
                                                    style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', background: '#fff' }}
                                                >
                                                    <option value="NIT">NIT</option>
                                                    <option value="CC">CC</option>
                                                    <option value="CE">CE</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={selectedClient.nit || ''}
                                                    onChange={(e) => handleChangeEditedClient('nit', e.target.value)}
                                                    style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', width: '120px', outline: 'none' }}
                                                    placeholder="Número..."
                                                />
                                            </div>
                                            <span>•</span>
                                            <select
                                                value={selectedClient.type || 'Jurídica'}
                                                onChange={(e) => {
                                                    const newType = e.target.value;
                                                    const newSubType = newType === 'Jurídica' ? 'B2B' : 'B2C';
                                                    handleChangeEditedClient('type', newType);
                                                    handleChangeEditedClient('subType', newSubType);
                                                }}
                                                style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', background: '#fff' }}
                                            >
                                                <option value="Jurídica">Jurídica (B2B)</option>
                                                <option value="Natural">Natural (B2C)</option>
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <span><strong style={{ color: '#475569' }}>{selectedClient.idType || 'NIT'}:</strong> {selectedClient.nit || 'No registrado'}</span>
                                            <span>•</span>
                                            <span>{selectedClient.type} ({selectedClient.subType})</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => { setSelectedClient(null); setIsEditingProfile(false); }} style={{ border: 'none', background: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={20} color="#64748b" /></button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '1rem' }}>
                                        <Building2 size={18} /> Información Comercial
                                    </div>
                                    <div style={{ display: 'grid', gap: '0.8rem', fontSize: '0.9rem' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>FUENTE DE PEDIDO</span>
                                            {isEditingProfile ? (
                                                <select
                                                    value={selectedClient.source || 'Web'}
                                                    onChange={(e) => handleChangeEditedClient('source', e.target.value)}
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                >
                                                    <option value="Web">Web</option>
                                                    <option value="Recurrente">Recurrente</option>
                                                    <option value="Distribuidor">Distribuidor</option>
                                                    <option value="Cliente">Cliente</option>
                                                </select>
                                            ) : (
                                                <strong style={{ color: '#1e293b' }}>{selectedClient.source || 'Web'}</strong>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>DIRECCIÓN</span>
                                            {isEditingProfile ? (
                                                <input type="text" value={selectedClient.address || ''} onChange={(e) => handleChangeEditedClient('address', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                            ) : (
                                                <strong style={{ color: '#1e293b' }}>{selectedClient.address || 'No registrada'}</strong>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>CIUDAD</span>
                                            {isEditingProfile ? (
                                                <input type="text" value={selectedClient.location || ''} onChange={(e) => handleChangeEditedClient('location', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                            ) : (
                                                <strong style={{ color: '#1e293b' }}>{selectedClient.location || 'No registrada'}</strong>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                            <User size={18} /> Datos de Contacto
                                        </div>
                                        {!isEditingProfile && (
                                            <button onClick={() => setIsEditingProfile(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                <Edit2 size={12} /> Editar
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gap: '0.8rem', fontSize: '0.9rem' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>CONTACTO PRINCIPAL</span>
                                            {isEditingProfile ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input type="text" placeholder="Nombre" value={selectedClient.contactName || ''} onChange={(e) => handleChangeEditedClient('contactName', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                                </div>
                                            ) : (
                                                <strong style={{ color: '#1e293b' }}>{selectedClient.contactName || 'No registrado'}</strong>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}><Phone size={12} style={{ display: 'inline' }} /> TELÉFONO</span>
                                            {isEditingProfile ? (
                                                <input type="tel" value={selectedClient.phone || ''} onChange={(e) => handleChangeEditedClient('phone', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                            ) : (
                                                <strong style={{ color: '#1e293b' }}>{selectedClient.phone || 'No registrado'}</strong>
                                            )}
                                        </div>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}><Mail size={12} style={{ display: 'inline' }} /> CORREO</span>
                                            {isEditingProfile ? (
                                                <input type="email" value={selectedClient.email || ''} onChange={(e) => handleChangeEditedClient('email', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                            ) : (
                                                <strong style={{ color: '#1e293b', wordBreak: 'break-all' }}>{selectedClient.email || 'No registrado'}</strong>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>SALDO EN CARTERA ACTUAL</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: selectedClient.balance > 0 ? '#ef4444' : '#10b981' }}>
                                        ${(selectedClient.balance || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {isEditingProfile ? (
                                    <button
                                        onClick={handleSaveChanges}
                                        style={{
                                            background: 'var(--color-primary)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: '0 4px 12px rgba(26, 54, 54, 0.2)'
                                        }}
                                    >
                                        <Save size={16} /> Guardar Cambios
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleStatus(selectedClient.id)}
                                        style={{
                                            background: selectedClient.status === 'Inactive' ? '#10b981' : '#fef2f2',
                                            color: selectedClient.status === 'Inactive' ? '#fff' : '#ef4444',
                                            border: `1px solid ${selectedClient.status === 'Inactive' ? '#10b981' : '#fca5a5'}`,
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {selectedClient.status === 'Inactive' ? 'Activar Cliente' : 'Inactivar Cliente'}
                                    </button>
                                )}
                                {!isEditingProfile && (
                                    <button
                                        onClick={() => handleDeleteClient(selectedClient.id)}
                                        style={{
                                            background: '#fff',
                                            color: '#ef4444',
                                            border: '1px solid #fca5a5',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Eliminar Cliente"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .client-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
                }
                .btn-premium:hover {
                    transform: scale(1.02);
                    transition: all 0.2s ease;
                }
            `}</style>
        </div>
    );
};

export default Clients;
