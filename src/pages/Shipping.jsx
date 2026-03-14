import React, { useState, useMemo } from 'react';
import {
    Truck,
    MapPin,
    Calendar,
    FileText,
    CheckCircle,
    Package,
    Clock,
    User,
    Hash,
    ArrowRight,
    DollarSign,
    ChevronRight,
    Search,
    Filter,
    X,
    Printer
} from 'lucide-react';

const Shipping = ({ orders, setOrders, items, setItems }) => {
    // Local state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeLabelOrder, setActiveLabelOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Barcode ID Mapping (extracted from Google Drive)
    const barcodes = {
        'ZT003001.gif': '1Ct1uyrDZjfWqEGnjFd1MMlx90YX0Zcfm',
        'ZT001502.gif': '1F_vYrkTpO7MTNNzIb_9YYQ6ePZcjWeOW',
        'ZT002006.gif': '1gbMQ7L5f_kzZ_nht7t0XLCv5QjvO0m9c'
    };

    // Recipe mapping for MP subtraction (Standard values)
    const recipes = {
        101: [ // Berenjena Toscana
            { id: 3, name: 'Berenjenas frescas', qtyPerUnit: 0.5 },
            { id: 4, name: 'Aceite de Oliva Premium', qtyPerUnit: 0.1 },
            { id: 1, name: 'Frasco 240g Vidrio', qtyPerUnit: 1 }
        ],
        102: [ // Dulce Silvia
            { id: 3, name: 'Berenjenas frescas', qtyPerUnit: 0.4 },
            { id: 4, name: 'Aceite de Oliva Premium', qtyPerUnit: 0.2 },
            { id: 1, name: 'Frasco 240g Vidrio', qtyPerUnit: 1 }
        ],
        103: [ // Ruibarbo & Fresa
            { id: 3, name: 'Berenjenas frescas', qtyPerUnit: 0.3 },
            { id: 4, name: 'Aceite de Oliva Premium', qtyPerUnit: 0.3 },
            { id: 1, name: 'Frasco 240g Vidrio', qtyPerUnit: 1 }
        ]
    };

    // Filter orders ready for logistics
    const filteredOrders = useMemo(() => {
        return orders.filter(o =>
            (o.status === 'Listo para Despacho' || o.status === 'Despachado' || o.status === 'Entregado') &&
            (o.client.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [orders, searchTerm]);

    const getProductInfo = (productId) => items.find(i => i.id === productId) || {};

    const handleProcessDispatch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const invoiceNum = formData.get('invoiceNum');
        const dispatchTime = formData.get('dispatchTime');

        const updatedInventory = [...items];
        selectedOrder.items.forEach(orderItem => {
            // PT inventory update
            const ptIndex = updatedInventory.findIndex(i => i.id === orderItem.id);
            if (ptIndex !== -1) {
                updatedInventory[ptIndex] = {
                    ...updatedInventory[ptIndex],
                    sales: (updatedInventory[ptIndex].sales || 0) + orderItem.quantity
                };
            }
            // MP inventory update based on BOM
            const recipe = recipes[orderItem.id] || [];
            recipe.forEach(mpReq => {
                const mpIndex = updatedInventory.findIndex(i => i.id === mpReq.id);
                if (mpIndex !== -1) {
                    updatedInventory[mpIndex] = {
                        ...updatedInventory[mpIndex],
                        sales: (updatedInventory[mpIndex].sales || 0) + (mpReq.qtyPerUnit * orderItem.quantity)
                    };
                }
            });
        });

        setItems(updatedInventory);
        setOrders(orders.map(o => o.id === selectedOrder.id ? {
            ...o,
            status: 'Despachado',
            invoiceNum,
            dispatchTime,
            shipmentDate: new Date().toISOString()
        } : o));

        alert(`Pedido ${selectedOrder.id} despachado exitosamente.`);
        setSelectedOrder(null);
    };

    const handleMarkAsDelivered = (orderId) => {
        if (!window.confirm("¿Estás seguro que quieres marcar este pedido como entregado?")) {
            return;
        }
        setOrders(orders.map(o => o.id === orderId ? {
            ...o,
            status: 'Entregado',
            deliveryDate: new Date().toISOString(),
            carteraStatus: 'Activa'
        } : o));
        alert(`Pedido finalizado.`);
    };

    return (
        <div className="shipping-module" style={{ padding: '0 1rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Logística y Despachos</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Gestión de salidas de producto terminado, facturación y etiquetado.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Buscar pedido o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>
            </header>

            {/* Logistics Table */}
            <section style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Pedido / Ref</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cliente</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Factura No.</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Estado</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--color-primary)' }}>{order.id}</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>{order.client}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.items.reduce((acc, i) => acc + i.quantity, 0)} unidades</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>
                                    {order.invoiceNum || <span style={{ color: '#cbd5e1' }}>Pendiente</span>}
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        background: order.status === 'Entregado' ? '#f0fdf4' : order.status === 'Despachado' ? '#fff7ed' : '#f0f9ff',
                                        color: order.status === 'Entregado' ? '#15803d' : order.status === 'Despachado' ? '#c2410c' : '#0369a1'
                                    }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setActiveLabelOrder(order)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer' }} title="Etiquetas"><Printer size={16} /></button>
                                        {order.status === 'Listo para Despacho' && (
                                            <button onClick={() => setSelectedOrder(order)} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}>Despachar</button>
                                        )}
                                        {order.status === 'Despachado' && (
                                            <button onClick={() => handleMarkAsDelivered(order.id)} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}>Entregado</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Labels Modal */}
            {activeLabelOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '2rem' }}>
                    <div style={{ background: '#fff', width: '900px', maxHeight: '90vh', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Etiquetas para Pedido: {activeLabelOrder.id}</h3>
                            <button onClick={() => setActiveLabelOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
                                {activeLabelOrder.items.map(orderItem => {
                                    const pt = getProductInfo(orderItem.id);
                                    const upx = pt.unitsPerBox || 12;
                                    const numLabels = Math.ceil(orderItem.quantity / upx);
                                    return Array.from({ length: numLabels }).map((_, i) => (
                                        <div key={`${orderItem.id}-${i}`} style={{
                                            background: '#fff', border: '3px solid #000', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#000', fontFamily: 'monospace'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>
                                                <strong style={{ fontSize: '1.2rem' }}>ZETICAS SAS</strong>
                                                <span>CAJA {i + 1}/{numLabels}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem' }}>PRODUCTO:</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{orderItem.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem' }}>CANTIDAD:</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{upx} UND</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.8rem' }}>REF:</div>
                                                    <div>{activeLabelOrder.id}</div>
                                                </div>
                                            </div>
                                            <div style={{ borderTop: '2px dashed #000', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                                                <div style={{ fontSize: '0.8rem' }}>CLIENTE:</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{activeLabelOrder.client}</div>
                                                <div style={{ fontSize: '0.8rem' }}>{activeLabelOrder.address || 'Carrera 45 # 100-24'}</div>
                                                <div style={{ fontSize: '0.8rem' }}>Tel: {activeLabelOrder.phone || '312 456 7890'}</div>
                                            </div>
                                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                                {pt.barcode && barcodes[pt.barcode] ? (
                                                    <img
                                                        src={`https://drive.google.com/uc?export=download&id=${barcodes[pt.barcode]}`}
                                                        style={{ height: '80px', width: '200px', objectFit: 'contain' }}
                                                        alt="Barcode"
                                                    />
                                                ) : <div style={{ border: '1px solid #000', padding: '1rem' }}>SIN CÓDIGO</div>}
                                                <div style={{ fontSize: '0.7rem' }}>{pt.barcode || '7700000000'}</div>
                                            </div>
                                        </div>
                                    ));
                                })}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                            <button onClick={() => window.print()} style={{ background: '#000', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Imprimir Todo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispatch Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', width: '450px', padding: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ marginTop: 0 }}>Despachar Pedido: {selectedOrder.id}</h3>
                        <form onSubmit={handleProcessDispatch}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>No. Factura</label>
                                <input type="text" name="invoiceNum" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>Hora de Salida</label>
                                <input type="time" name="dispatchTime" required defaultValue="08:00" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setSelectedOrder(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}>Cerrar</button>
                                <button type="submit" style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold' }}>Confirmar Salida</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shipping;
