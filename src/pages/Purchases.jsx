import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ShoppingCart,
    Calendar,
    ArrowRight,
    CheckCircle,
    Package,
    FileText,
    ChevronDown,
    Users,
    Plus,
    Save,
    AlertCircle,
    Truck,
    Check,
    Download,
    Eye,
    X
} from 'lucide-react';

const Purchases = ({ orders, setOrders, items, setItems, purchaseOrders, setPurchaseOrders }) => {
    // Local State for BOM Explosion & OC Generation
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [supplierAssignments, setSupplierAssignments] = useState({}); // { mpId: supplierName }
    const [viewingOC, setViewingOC] = useState(null); // Modal state for OC

    const handleDownloadOCPDF = async (oc) => {
        const doc = new jsPDF();

        // Header Build
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text('ORDEN DE COMPRA', 14, 22);

        try {
            const logoUrl = 'https://obsvdzlsbbqmhpsxksnd.supabase.co/storage/v1/object/public/assets/logo.png';
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = logoUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            const imgWidth = 45;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'PNG', 196 - imgWidth, 12, imgWidth, imgHeight);
        } catch (error) {
            console.error("Error loading logo for PDF", error);
        }

        // OC Info
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`OC No: ${oc.id}`, 14, 30);
        doc.text(`Fecha: ${oc.date}`, 14, 35);
        doc.text(`Ref. Pedido: ${oc.orderRef}`, 14, 40);

        doc.setDrawColor(226, 232, 240);
        doc.line(14, 45, 196, 45);

        // Vendor (Zeticas)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text('COMPRADOR / FACTURAR A:', 14, 55);
        doc.setFont('helvetica', 'bold');
        doc.text('Zeticas S.A.S.', 14, 60);
        doc.setFont('helvetica', 'normal');
        doc.text('NIT: 901.234.567-8', 14, 65);
        doc.text('Bogotá, Colombia', 14, 70);

        // Supplier Data
        const supplierInfo = suppliers.find(s => s.name === oc.supplier);
        doc.text('DATOS DEL PROVEEDOR', 105, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(oc.supplier, 105, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(`NIT: ${supplierInfo?.nit || 'No Registrado'}`, 105, 65);
        doc.text(`Tiempo de Entrega: ${supplierInfo?.lead_time || 'A convenir'}`, 105, 70);

        // Products Table
        const tableColumn = ["ID / Ref", "Insumo", "Cant.", "Und", "V. Unitario", "IVA", "V. Total"];
        const tableRows = [];

        // Mock taxes (IVA = 19%)
        let subtotal = 0;
        let totalTaxes = 0;

        oc.items.forEach(item => {
            const unitValue = item.purchasePrice || 0;
            const itemTotal = unitValue * item.toBuy;
            const iva = itemTotal * 0.19; // Simplified 19% VAT for illustration

            subtotal += itemTotal;
            totalTaxes += iva;

            tableRows.push([
                item.id,
                item.name,
                item.toBuy,
                item.unit,
                `$${Math.round(unitValue).toLocaleString()}`,
                `19%`,
                `$${Math.round(itemTotal).toLocaleString()}`
            ]);
        });

        const numFormat = (num) => `$${Math.round(num).toLocaleString()}`;

        autoTable(doc, {
            startY: 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [45, 79, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
        });

        const finalY = doc.lastAutoTable?.finalY || 85;
        const grantotal = subtotal + totalTaxes;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Subtotal: ${numFormat(subtotal)}`, 196, finalY + 10, { align: 'right' });
        doc.text(`Impuestos (19%): ${numFormat(totalTaxes)}`, 196, finalY + 15, { align: 'right' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`TOTAL OC: ${numFormat(grantotal)}`, 196, finalY + 23, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Documento oficial de compras - Zeticas OS', 105, 280, { align: 'center' });

        doc.save(`${oc.id}.pdf`);
    };

    // Mock Data for JIT Flow
    const recipes = {
        101: [ // Berenjena Toscana
            { id: 'MP001', name: 'Berenjenas frescas', qtyPerUnit: 0.5, unit: 'kg' },
            { id: 'MP002', name: 'Aceite de Oliva', qtyPerUnit: 0.1, unit: 'lt' },
            { id: 'MP003', name: 'Frasco Vidrio', qtyPerUnit: 1, unit: 'und' }
        ],
        102: [ // Dulce Silvia
            { id: 'MP004', name: 'Fruta base (Mora/Fresa)', qtyPerUnit: 0.4, unit: 'kg' },
            { id: 'MP005', name: 'Azúcar orgánica', qtyPerUnit: 0.2, unit: 'kg' },
            { id: 'MP003', name: 'Frasco Vidrio', qtyPerUnit: 1, unit: 'und' }
        ],
        103: [ // Ruibarbo & Fresa
            { id: 'MP006', name: 'Ruibarbo', qtyPerUnit: 0.3, unit: 'kg' },
            { id: 'MP004', name: 'Fruta base (Mora/Fresa)', qtyPerUnit: 0.3, unit: 'kg' },
            { id: 'MP003', name: 'Frasco Vidrio', qtyPerUnit: 1, unit: 'und' }
        ]
    };

    const mpInventory = {
        'MP001': { stock: 12, unit: 'kg' },
        'MP002': { stock: 5, unit: 'lt' },
        'MP003': { stock: 15, unit: 'und' },
        'MP004': { stock: 8, unit: 'kg' },
        'MP005': { stock: 20, unit: 'kg' },
        'MP006': { stock: 0, unit: 'kg' },
    };

    const suppliers = [
        { id: 1, name: 'EcoAbastos SAS', mpHandled: ['MP001', 'MP004', 'MP006'] },
        { id: 2, name: 'Suministros Vidrio S.A.', mpHandled: ['MP003'] },
        { id: 3, name: 'Distribuidora Esencias', mpHandled: ['MP002', 'MP005'] }
    ];

    // Filter orders that are in "En Compras"
    const ordersInPurchaseChannel = useMemo(() => orders.filter(o => o.status === 'En Compras'), [orders]);

    // BOM Explosion for selected order
    const requirementExplosion = useMemo(() => {
        if (!selectedOrderId) return [];
        const order = orders.find(o => o.id === selectedOrderId);
        if (!order) return [];

        const explosion = {};
        order.items.forEach(item => {
            const recipe = recipes[item.id] || [];
            recipe.forEach(mp => {
                const totalNeeded = mp.qtyPerUnit * item.quantity;
                if (!explosion[mp.id]) {
                    explosion[mp.id] = { ...mp, totalNeeded: 0 };
                }
                explosion[mp.id].totalNeeded += totalNeeded;
            });
        });

        return Object.values(explosion).map(mp => {
            const available = mpInventory[mp.id]?.stock || 0;
            const toBuy = Math.max(0, mp.totalNeeded - available);
            return {
                ...mp,
                available,
                toBuy
            };
        });
    }, [selectedOrderId, orders]);

    // Actions
    const handleAssignSupplier = (mpId, supplierName) => {
        setSupplierAssignments({
            ...supplierAssignments,
            [mpId]: supplierName
        });
    };

    const handleGenerateOC = () => {
        const pendingItems = requirementExplosion.filter(item => item.toBuy > 0 && !supplierAssignments[item.id]);
        if (pendingItems.length > 0) {
            alert('Debes asignar un proveedor a todas las materias primas con faltante (marcadas en rojo).');
            return;
        }

        // Group by supplier
        const itemsBySupplier = {};
        requirementExplosion.filter(item => item.toBuy > 0).forEach(item => {
            const supplier = supplierAssignments[item.id];
            if (!itemsBySupplier[supplier]) itemsBySupplier[supplier] = [];
            itemsBySupplier[supplier].push(item);
        });

        const newOCs = Object.keys(itemsBySupplier).map(supplier => ({
            id: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
            supplier,
            orderRef: selectedOrderId,
            date: new Date().toISOString().split('T')[0],
            status: 'Enviada',
            items: itemsBySupplier[supplier].map(item => ({
                ...item,
                purchasePrice: (items.find(i => i.id === item.id || i.name === item.name)?.avgCost || 1000) * (1 + (Math.random() * 0.2 - 0.1)) // Mock fluctuation
            }))
        }));

        setPurchaseOrders([...newOCs, ...purchaseOrders]);

        // Update Order Status to "En Compras (OC Generadas)"
        setOrders(orders.map(o => o.id === selectedOrderId ? { ...o, status: 'En Compras (OC Generadas)' } : o));

        setSelectedOrderId(null);
        setSupplierAssignments({});
        alert('Órdenes de Compra generadas y enviadas a proveedores.');
    };

    const handleReceiveOC = (ocId) => {
        if (!window.confirm("¿Estás seguro que quieres realizar esta acción? El inventario y los costos promedio se actualizarán automáticamente.")) {
            return;
        }
        const oc = purchaseOrders.find(o => o.id === ocId);

        // 1. Update Inventory MP (purchases column) AND Cost (Weighted Average)
        const updatedInventory = [...items];
        oc.items.forEach(ocItem => {
            const invItemIndex = updatedInventory.findIndex(i => i.id === ocItem.id || i.name === ocItem.name);
            if (invItemIndex !== -1) {
                const item = updatedInventory[invItemIndex];
                const currentStock = (item.initial || 0) + (item.purchases || 0) - (item.sales || 0);
                const currentTotalValue = currentStock * (item.avgCost || 0);
                const purchaseValue = ocItem.toBuy * ocItem.purchasePrice;

                const newTotalQty = currentStock + ocItem.toBuy;
                const newAvgCost = newTotalQty > 0 ? (currentTotalValue + purchaseValue) / newTotalQty : item.avgCost;

                updatedInventory[invItemIndex] = {
                    ...item,
                    purchases: (item.purchases || 0) + ocItem.toBuy,
                    avgCost: Math.round(newAvgCost)
                };
            }
        });
        setItems(updatedInventory);

        // 2. Update OC status
        const updatedOCs = purchaseOrders.map(o => {
            if (o.id === ocId) return { ...o, status: 'Recibida' };
            return o;
        });
        setPurchaseOrders(updatedOCs);

        // 3. Flow Check: If all OCs for a reference are received, move to production
        const refId = oc.orderRef;
        const allForRef = updatedOCs.filter(o => o.orderRef === refId);
        const allReceived = allForRef.every(o => o.status === 'Recibida');

        if (allReceived) {
            setOrders(orders.map(o => o.id === refId ? { ...o, status: 'En Producción' } : o));
            alert(`El pedido ${refId} ha recibido todos sus materiales y ha pasado a ESTADO: EN PRODUCCIÓN.`);
        }
    };

    return (
        <div className="purchases-module" style={{ padding: '0 1rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Gestión Lean de Compras (MP)</h2>
                <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.5rem' }}>Explosión de requerimientos y abastecimiento JIT basado en pedidos reales.</p>
            </header>

            {/* Selection of Active Orders from Pedidos Module */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <FileText size={20} color="var(--color-primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>Pedidos en Cola para Abastecimiento</h3>
                </div>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                    {ordersInPurchaseChannel.length > 0 ? ordersInPurchaseChannel.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            style={{
                                minWidth: '280px',
                                padding: '1.2rem',
                                background: selectedOrderId === order.id ? '#1A3636' : '#fff',
                                color: selectedOrderId === order.id ? '#fff' : '#334155',
                                borderRadius: '16px',
                                border: selectedOrderId === order.id ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedOrderId === order.id ? '0 10px 20px rgba(26, 54, 54, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{order.id}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{order.date}</span>
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.4rem' }}>{order.client}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{order.items.length} productos terminados</div>
                            {selectedOrderId === order.id && (
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                                    EXPLOSIONANDO REQUERIMIENTOS...
                                </div>
                            )}
                        </div>
                    )) : (
                        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8', width: '100%', textAlign: 'center' }}>
                            No hay pedidos pendientes por abastecer. Envía pedidos desde el módulo de "Pedidos".
                        </div>
                    )}
                </div>
            </section>

            {/* Requirement Explosion & Supplier Assignment */}
            {selectedOrderId && (
                <section style={{
                    background: '#fff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    padding: '2rem',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.05)',
                    marginBottom: '3rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-primary)' }}>Análisis de Materiales JIT - {selectedOrderId}</h3>
                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Explosión de BOM: Unidades x Receta - Stock Disponible = Cantidad a Comprar.</p>
                        </div>
                        <button
                            onClick={handleGenerateOC}
                            style={{
                                background: 'var(--color-primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.8rem 1.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem'
                            }}
                        >
                            <Truck size={18} /> Generar Órdenes de Compra
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Materia Prima (MP)</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>MP Requerida</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>INV. Disponible</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cant. a Comprar</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Proveedor Sugerido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirementExplosion.map(mp => (
                                <tr key={mp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ fontWeight: '700', color: '#334155' }}>{mp.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {mp.id}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '600' }}>{mp.totalNeeded} {mp.unit}</td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', color: '#64748b' }}>{mp.available} {mp.unit}</td>
                                    <td style={{
                                        padding: '1.2rem 1rem',
                                        textAlign: 'right',
                                        fontWeight: '800',
                                        color: mp.toBuy > 0 ? (supplierAssignments[mp.id] ? '#d97706' : '#ef4444') : '#10b981'
                                    }}>
                                        {mp.toBuy} {mp.unit}
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                        {mp.toBuy > 0 ? (
                                            <select
                                                value={supplierAssignments[mp.id] || ''}
                                                onChange={(e) => handleAssignSupplier(mp.id, e.target.value)}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.85rem',
                                                    width: '180px',
                                                    outline: 'none',
                                                    borderLeft: supplierAssignments[mp.id] ? '4px solid #10b981' : '4px solid #ef4444'
                                                }}
                                            >
                                                <option value="">Seleccionar Proveedor...</option>
                                                {suppliers.filter(s => s.mpHandled.includes(mp.id)).map(s => (
                                                    <option key={s.id} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>STOCK SUFICIENTE</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* List of Generated Purchase Orders (OC) */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <ShoppingCart size={20} color="var(--color-primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>Historial de Órdenes de Compra (OC)</h3>
                </div>

                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.2rem' }}>OC No.</th>
                                <th style={{ padding: '1.2rem' }}>Proveedor</th>
                                <th style={{ padding: '1.2rem' }}>Ref. Pedido</th>
                                <th style={{ padding: '1.2rem' }}>Fecha</th>
                                <th style={{ padding: '1.2rem' }}>Estado</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Acciones</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Descargar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.length > 0 ? purchaseOrders.map(oc => (
                                <tr
                                    key={oc.id}
                                    style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="table-row-hover"
                                    onClick={() => setViewingOC(oc)}
                                >
                                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: '800', color: 'var(--color-primary)' }}>{oc.id}</td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: '600' }}>{oc.supplier}</td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>{oc.orderRef}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center', fontSize: '0.85rem' }}>{oc.date}</td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            background: oc.status === 'Recibida' ? '#ecfdf5' : '#eff6ff',
                                            color: oc.status === 'Recibida' ? '#059669' : '#1e40af'
                                        }}>
                                            {oc.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        {oc.status === 'Enviada' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleReceiveOC(oc.id); }}
                                                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
                                            >
                                                <Check size={14} /> Registrar Ingreso
                                            </button>
                                        )}
                                        {oc.status === 'Recibida' && (
                                            <span style={{ color: '#10b981', display: 'flex', justifyContent: 'center' }}><CheckCircle size={18} /></span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadOCPDF(oc); }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#1A3636'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                            title="Descargar PDF"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No hay órdenes de compra generadas aún.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* OC Detail Modal */}
            {viewingOC && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)' }}>Orden de Compra</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Documento Interno - {viewingOC.id}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => handleDownloadOCPDF(viewingOC)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'var(--color-primary)', color: '#fff',
                                        border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px',
                                        fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <Download size={16} /> Descargar PDF
                                </button>
                                <button
                                    onClick={() => setViewingOC(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <h4 style={{ margin: '0 0 1rem', color: '#1A3636', fontSize: '0.85rem', textTransform: 'uppercase' }}>Comprador / Facturar a:</h4>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#334155', marginBottom: '0.2rem' }}>Zeticas S.A.S.</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        NIT: 901.234.567-8<br />
                                        Bogotá, Colombia<br />
                                        Ref. Pedido Interno: {viewingOC.orderRef}
                                    </div>
                                </div>
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px' }}>
                                    <h4 style={{ margin: '0 0 1rem', color: '#166534', fontSize: '0.85rem', textTransform: 'uppercase' }}>Datos del Proveedor:</h4>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#15803d', marginBottom: '0.2rem' }}>{viewingOC.supplier}</div>
                                    <div style={{ color: '#166534', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        NIT: {suppliers.find(s => s.name === viewingOC.supplier)?.nit || 'No Registrado'}<br />
                                        Tiempo de entrega: {suppliers.find(s => s.name === viewingOC.supplier)?.lead_time || 'A convenir'}<br />
                                        Fecha OC: {viewingOC.date}
                                    </div>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--color-primary)', color: '#fff' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', borderRadius: '8px 0 0 0' }}>Ref/Insumo</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem' }}>Cantidad</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>V. Unitario</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>IVA</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', borderRadius: '0 8px 0 0' }}>V. Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingOC.items.map((item, idx) => {
                                        const unitValue = item.purchasePrice || 0;
                                        const total = unitValue * item.toBuy;
                                        return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#334155' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {item.id}</div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>{item.toBuy} {item.unit}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>${Math.round(unitValue).toLocaleString()}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>19%</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>${Math.round(total).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '300px', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    {(() => {
                                        let sub = 0;
                                        let iva = 0;
                                        viewingOC.items.forEach(i => {
                                            const v = (i.purchasePrice || 0) * i.toBuy;
                                            sub += v;
                                            iva += v * 0.19;
                                        });
                                        return (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                                                    <span>Subtotal:</span>
                                                    <span>${Math.round(sub).toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b' }}>
                                                    <span>Impuestos (19%):</span>
                                                    <span>${Math.round(iva).toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #e2e8f0', fontWeight: '800', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                                                    <span>TOTAL OC:</span>
                                                    <span>${Math.round(sub + iva).toLocaleString()}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
