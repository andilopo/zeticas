import React, { useState, useMemo, useCallback } from 'react';
import {
    UserPlus, Calendar, BarChart3, MessageSquare, Clock, Edit2, X, CheckSquare,
    ChevronDown, Check, Trash2, Download, TrendingUp, CheckCircle2, Phone,
    Mail, FileText, ShoppingCart, Search, RefreshCw, Zap, MapPin, Plus, CheckCircle, Save, Truck
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { colombia_cities } from '../data/colombia_cities';

const CRM = () => {
    const { addClient, leads, updateLead, deleteLead, addLead, addQuotation, quotations, items: masterProducts, siteContent, ownCompany } = useBusiness();
    const isMobile = useMediaQuery('(max-width: 1024px)');

    // Premium Branding Colors
    const deepTeal = "#023636";
    const institutionOcre = "#D4785A";

    const [editingLead, setEditingLead] = useState(null);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentQuoteLead, setCurrentQuoteLead] = useState(null);
    const [showTaskList, setShowTaskList] = useState(false);
    const [taskFilterDate, setTaskFilterDate] = useState('');
    const [quoteSearch, setQuoteSearch] = useState('');
    const [quoteValidity, setQuoteValidity] = useState(15);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({
        name: '',
        phone: '',
        email: '',
        interest_type: 'General',
        city: '',
        address: '',
        estimated_volume: '',
        stage: 'Nuevo Lead'
    });

    // Quotation State
    const [quoteItems, setQuoteItems] = useState([]);
    const [quoteDiscount, setQuoteDiscount] = useState(0);

    // Shipping Settings from siteContent
    const shipSettings = useMemo(() => {
        const s = siteContent?.web_shipping || {};
        return {
            tarifa_local: Number(s.tarifa_local) || 5500,
            tarifa_regional: Number(s.tarifa_regional) || 8500,
            tarifa_nacional: Number(s.tarifa_nacional) || 14500,
            threshold_free: Number(s.threshold_free) || 135000,
            origin_city: s.origin_city || 'Guasca'
        };
    }, [siteContent]);

    const getShippingCost = useCallback((city, subtotal) => {
        if (!city || subtotal >= shipSettings.threshold_free) return 0;
        
        const destination = colombia_cities.find(c => 
            c.city.toLowerCase() === city.toLowerCase()
        );

        let rate = shipSettings.tarifa_nacional;
        if (destination) {
            if (destination.city === shipSettings.origin_city) rate = shipSettings.tarifa_local;
            else if (destination.state === 'Cundinamarca' || destination.state === 'Boyacá') rate = shipSettings.tarifa_regional;
        }

        // Standard logic: 1 unit of weight for standard quotes
        return rate;
    }, [shipSettings]);

    const stages = ['Nuevo Lead', 'Cotización Enviada', 'Clientes Ingresados'];

    const handleDrop = async (e, newStage) => {
        const leadId = e.dataTransfer.getData('leadId');
        if (!leadId) return;

        const lead = leads.find(l => l.id === leadId);
        if (newStage === 'Cotización Enviada' && (!lead.city || !lead.address)) {
            alert("No puedes enviar una cotización sin antes registrar la CIUDAD y DIRECCIÓN del prospecto.");
            setEditingLead(lead);
            return;
        }

        await updateLead(leadId, { stage: newStage });
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        if (!newLead.name || !newLead.phone) {
            alert("Por favor ingresa al menos Nombre y Teléfono.");
            return;
        }

        const res = await addLead({
            ...newLead,
            status: 'Active',
            created_at: new Date().toISOString()
        });

        if (res.success) {
            alert("¡Nuevo prospecto agregado con éxito!");
            setIsAddModalOpen(false);
            setNewLead({
                name: '',
                phone: '',
                email: '',
                interest_type: 'General',
                city: '',
                address: '',
                estimated_volume: '',
                stage: 'Nuevo Lead'
            });
        }
    };

    const pendingTasksCount = useMemo(() => {
        return leads.filter(l => l.follow_up_date && !l.task_completed).length;
    }, [leads]);

    const handleCompleteTask = async (leadId) => {
        await updateLead(leadId, { task_completed: true });
    };

    const handleConvertToClient = async (lead) => {
        const confirmConversion = window.confirm(`¿Convertir a ${lead.name} en Cliente Maestro?`);
        if (!confirmConversion) return;

        const res = await addClient({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            city: lead.city,
            type: lead.interest_type || 'General',
            nit: lead.nit || 'PENDIENTE',
            address: lead.address || 'PENDIENTE'
        });

        if (res.success) {
            await updateLead(lead.id, { stage: 'Clientes Ingresados' });
            alert("Cliente creado con éxito en Datos Maestros.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este prospecto?")) {
            await deleteLead(id);
        }
    };

    const generatePDF = async (lead, items, discountPercent, isDownload = false) => {
        const doc = new jsPDF();
        const primaryColor = [2, 54, 54]; // #023636
        
        const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
        const discountAmount = Math.round((subtotal * discountPercent / 100) / 100) * 100;
        const shipping = getShippingCost(lead.city, subtotal);
        const rawTotal = subtotal + shipping - discountAmount;
        const total = Math.round(rawTotal / 100) * 100;
        const date = new Date().toLocaleDateString();
        const validityDate = new Date();
        validityDate.setDate(validityDate.getDate() + Number(quoteValidity));
        const validityStr = validityDate.toLocaleDateString();

        setCurrentQuoteLead(lead);

        // 1. Logo "zeticas" in serif
        doc.setFont('times', 'bold');
        doc.setFontSize(30);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('zeticas', 20, 30);

        // Company Details (Ocre)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(212, 120, 90); 
        doc.text(ownCompany.name || 'Zeticas SAS BIC', 20, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`NIT: ${ownCompany.nit || '901.531.875-4'}`, 20, 45);
        doc.text(`${ownCompany.city || 'Guasca'}, ${ownCompany.department || 'Cundinamarca'}`, 20, 50);

        // Quote Title & ID
        const ref = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('COTIZACIÓN COMERCIAL', 196, 30, { align: 'right' });
        doc.setFontSize(14);
        doc.text(ref, 196, 40, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${date}`, 196, 48, { align: 'right' });
        doc.setTextColor(212, 120, 90);
        doc.setFont('helvetica', 'bold');
        doc.text(`Validez: ${validityStr} (${quoteValidity} días)`, 196, 54, { align: 'right' });

        // Horizontal Rule
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.8);
        doc.line(14, 60, 196, 60);

        // 4. Info Cards
        // Client Info
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 65, 88, 30, 2, 2, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(14, 65, 88, 30, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text('CLIENTE', 18, 70);

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(lead.name || 'N/A', 18, 76);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Tel: ${lead.phone || 'N/A'}`, 18, 81);
        doc.text(`Email: ${lead.email || 'N/A'}`, 18, 86);

        // Shipping Info
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(108, 65, 88, 30, 2, 2, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(108, 65, 88, 30, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text('DIRECCIÓN DE ENTREGA', 112, 70);

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(lead.address || 'N/A', 112, 76);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${lead.city || 'N/A'}, Colombia`, 112, 81);

        // 5. Items Table
        autoTable(doc, {
            startY: 105,
            head: [['DESCRIPCIÓN', 'CANTIDAD', 'V. UNITARIO', 'V. TOTAL']],
            body: [
                ...items.map(i => [
                    i.name,
                    i.qty,
                    `$${(i.price || 0).toLocaleString()}`,
                    `$${(i.price * i.qty).toLocaleString()}`
                ])
            ],
            theme: 'grid',
            styles: { fontSize: 8.5, cellPadding: 4, textColor: [30, 41, 59] },
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 30 },
                2: { halign: 'right', cellWidth: 35 },
                3: { halign: 'right', cellWidth: 35 }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
        });

        // 6. Totals
        const pageHeight = doc.internal.pageSize.height;
        let finalY = doc.lastAutoTable.finalY + 10;
        const numFormat = (num) => `$${Math.round(num).toLocaleString()}`;

        if (finalY + 60 > pageHeight) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('SUBTOTAL:', 145, finalY + 6, { align: 'right' });
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(numFormat(subtotal), 196, finalY + 6, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`FLETE A ${lead.city.toUpperCase()}:`, 145, finalY + 12, { align: 'right' });
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(numFormat(shipping), 196, finalY + 12, { align: 'right' });

        if (discountPercent > 0) {
            doc.setFontSize(9);
            doc.setTextColor(239, 68, 68);
            doc.text(`DESCUENTO (${discountPercent}%):`, 145, finalY + 18, { align: 'right' });
            doc.text(`-${numFormat(discountAmount)}`, 196, finalY + 18, { align: 'right' });
        }

        const badgeY = discountPercent > 0 ? finalY + 26 : finalY + 20;
        doc.setFillColor(240, 253, 244); 
        doc.roundedRect(110, badgeY, 90, 12, 2, 2, 'F');

        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('TOTAL NETO:', 145, badgeY + 8, { align: 'right' });
        doc.setFontSize(14);
        doc.text(numFormat(total), 196, badgeY + 8, { align: 'right' });

        const footerY = badgeY + 25;
        if (footerY + 30 < pageHeight) {
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184);
            doc.setFont('helvetica', 'italic');
            doc.text('Este documento es una cotización comercial y no constituye una factura de venta.', 105, footerY, { align: 'center' });
            doc.text(`Zeticas - Generado el ${date} - ${ownCompany.website || 'zeticas.com'}`, 105, footerY + 5, { align: 'center' });
        }

        // Lead update and Persistence
        const quoteData = {
            ref,
            leadId: lead.id,
            leadName: lead.name,
            items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
            subtotal,
            discountPercent,
            discountAmount,
            shipping,
            total,
            date,
            validityDate: validityStr,
            createdAt: new Date().toISOString()
        };

        await addQuotation(quoteData);

        // Update lead metrics
        updateLead(lead.id, {
            stage: 'Cotización Enviada',
            total_quoted: (lead.total_quoted || 0) + total,
            last_quote_date: date
        });

        if (isDownload) {
            doc.save(`Cotizacion_${lead.name}_${ref}.pdf`);
            return;
        }
        
        const pdfDataUri = doc.output('datauristring');
        setPdfPreviewUrl(pdfDataUri);
        setIsPdfModalOpen(true);
    };

    const getColumnColor = (stage) => {
        switch (stage) {
            case 'Nuevo Lead': return '#3b82f6';
            case 'Cotización Enviada': return institutionOcre;
            case 'Clientes Ingresados': return '#10b981';
            default: return deepTeal;
        }
    };

    const modalInputStyle = { width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' };

    return (
        <div style={{ padding: '0 1rem', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.6s ease-out' }}>

            {/* Top Bar with Pending Tasks Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
                    {[
                        { label: 'Ingresar Nuevo Lead', val: leads.filter(l => l.stage !== 'Clientes Ingresados').length, color: '#3b82f6', icon: <UserPlus />, action: () => setIsAddModalOpen(true) },
                        { label: 'Conversiones', val: leads.filter(l => l.stage === 'Clientes Ingresados').length, color: '#10b981', icon: <CheckCircle2 /> }
                    ].map((stat, idx) => (
                        <div 
                            key={idx} 
                            onClick={stat.action}
                            style={{ 
                                background: '#fff', 
                                padding: '1.5rem 2rem', 
                                borderRadius: '25px', 
                                border: '1px solid #f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1.5rem', 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.02)', 
                                flex: 1,
                                cursor: stat.action ? 'pointer' : 'default',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => stat.action && (e.currentTarget.style.transform = 'translateY(-5px)')}
                            onMouseLeave={e => stat.action && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ width: '48px', height: '48px', background: `${stat.color}10`, color: stat.color, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: deepTeal }}>{stat.val}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Tasks Calendar-style indicator */}
                <div
                    onClick={() => setShowTaskList(!showTaskList)}
                    style={{
                        background: pendingTasksCount > 0 ? institutionOcre : '#fff',
                        color: pendingTasksCount > 0 ? '#fff' : deepTeal,
                        padding: '1.5rem 2rem', borderRadius: '25px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid #f1f5f9',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative', transition: 'all 0.3s'
                    }}
                >
                    <Calendar size={28} />
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>{pendingTasksCount}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>Tareas Pendientes</div>
                    </div>
                    {showTaskList && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '1rem', width: '350px', background: '#fff', borderRadius: '20px', boxShadow: '0 15px 45px rgba(0,0,0,0.15)', zIndex: 100, padding: '1.5rem', color: deepTeal }} onClick={(e) => e.stopPropagation()}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Seguimientos Pendientes
                                <X size={18} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowTaskList(false); }} />
                            </h4>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', marginBottom: '0.3rem' }}>FILTRAR POR FECHA</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="date" value={taskFilterDate} onChange={(e) => setTaskFilterDate(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }} />
                                    {taskFilterDate && <button onClick={() => setTaskFilterDate('')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0 10px', cursor: 'pointer' }} title="Limpiar Filtro"><X size={14} /></button>}
                                </div>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {leads.filter(l => l.follow_up_date && !l.task_completed && (!taskFilterDate || l.follow_up_date === taskFilterDate)).map(task => (
                                    <div key={task.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: '800' }}>{task.name} - {task.follow_up_date}</div>
                                        <div style={{ color: '#64748b', margin: '4px 0' }}>{task.follow_up_note || 'Sin nota'}</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id); }}
                                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer', marginTop: '5px' }}
                                        >Marcar como cumplido</button>
                                    </div>
                                ))}
                                {leads.filter(l => l.follow_up_date && !l.task_completed && (!taskFilterDate || l.follow_up_date === taskFilterDate)).length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>{taskFilterDate ? 'No hay tareas para esta fecha' : 'No hay tareas pendientes'}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Kanban Board - Responsive Grid */}
            <div className="crm-kanban-board">
                {stages.map(stage => {
                    const columnLeads = leads.filter(l => l.stage === stage);
                    const color = getColumnColor(stage);
                    return (
                        <div key={stage} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage)} style={{ background: 'rgba(241, 245, 249, 0.5)', borderRadius: '25px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', overflow: 'hidden' }}>
                            <div style={{ padding: '1.2rem 1.5rem', borderBottom: `4px solid ${color}`, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: deepTeal, textTransform: 'uppercase', letterSpacing: '1px' }}>{stage}</h3>
                                <div style={{ background: `${color}15`, color: color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900' }}>{columnLeads.length}</div>
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {columnLeads.map(lead => (
                                    <div
                                        key={lead.id}
                                        draggable
                                        onDragStart={e => e.dataTransfer.setData('leadId', lead.id)}
                                        style={{ background: '#fff', padding: '1.5rem', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'grab', border: '1px solid #f1f5f9', transition: 'all 0.3s' }}
                                        className="lead-card-hover"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#1e293b' }}>{lead.name}</h4>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }} style={{ background: 'transparent', border: 'none', color: deepTeal, cursor: 'pointer', opacity: 0.5 }}><Edit2 size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.3 }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>

                                        <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Phone size={14} opacity={0.5} /> {lead.phone || 'N/A'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Mail size={14} opacity={0.5} /> {lead.email || 'N/A'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={14} opacity={0.5} /> {lead.city || 'N/A'}</div>
                                            {lead.address && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '1.5rem', marginTop: '-0.4rem' }}>{lead.address}</div>}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ShoppingCart size={14} opacity={0.5} /> {lead.estimated_volume || 'N/A'}</div>
                                        </div>

                                        {lead.follow_up_date && !lead.task_completed && (
                                            <div style={{ marginTop: '1rem', padding: '8px', background: `${institutionOcre}10`, borderRadius: '10px', fontSize: '0.75rem', color: institutionOcre, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={12} /> Tarea: {lead.follow_up_date}
                                            </div>
                                        )}

                                        <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuoteItems([]);
                                                    setQuoteDiscount(0);
                                                    setIsQuotationModalOpen(lead);
                                                }}
                                                style={{ flex: '1 1 auto', background: deepTeal, color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem', fontWeight: '900', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                            >
                                                <FileText size={14} /> COTIZAR
                                            </button>
                                            <button
                                                title="Nueva Tarea"
                                                onClick={(e) => { e.stopPropagation(); setIsFollowUpModalOpen(lead); }}
                                                style={{ flex: '0 0 auto', background: '#f8fafc', color: deepTeal, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Calendar size={14} />
                                            </button>
                                            {lead.stage === 'Cotización Enviada' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleConvertToClient(lead); }}
                                                    style={{ flex: '1 1 100%', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem', fontWeight: '900', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '4px' }}
                                                >
                                                    <CheckCircle size={14} /> CONVERTIR
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
 
            {/* Edit / Detail Modal */}
            {editingLead && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    right: 0, 
                    bottom: 0, 
                    left: isMobile ? 0 : '280px', 
                    background: 'rgba(0,0,0,0.6)', 
                    backdropFilter: 'blur(15px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 20000, 
                    padding: '1.5rem'
                }}>
                    <div style={{ 
                        background: '#fff', 
                        width: '100%', 
                        maxWidth: '460px', 
                        borderRadius: '40px', 
                        padding: '2.5rem', 
                        boxShadow: '0 40px 100px rgba(0,0,0,0.4)', 
                        position: 'relative', 
                        maxHeight: '90vh', 
                        overflowY: 'auto',
                        animation: 'scaleUp 0.3s ease'
                    }}>
                        <button onClick={() => setEditingLead(null)} style={{ position: 'absolute', top: '25px', right: '25px', background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '0.6rem', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', color: deepTeal, fontSize: '1.6rem' }}>Editar Prospecto</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Ajusta la información comercial del contacto.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[
                                { label: 'Nombre Completo', value: editingLead.name, key: 'name' },
                                { label: 'NIT / Identificación', value: editingLead.nit, key: 'nit' },
                                { label: 'Teléfono / WhatsApp', value: editingLead.phone, key: 'phone' },
                                { label: 'Email Comercial', value: editingLead.email, key: 'email' },
                                { label: 'Ciudad', value: editingLead.city, key: 'city', list: 'cities-list' },
                                { label: 'Dirección de Entrega', value: editingLead.address, key: 'address' },
                                { label: 'Volumen Estimado', value: editingLead.estimated_volume, key: 'estimated_volume' }
                            ].map((field) => (
                                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, opacity: 0.6, letterSpacing: '0.5px' }}>{field.label.toUpperCase()}</label>
                                    <input 
                                        type="text" 
                                        list={field.list}
                                        value={field.value || ''} 
                                        onChange={(e) => setEditingLead({ ...editingLead, [field.key]: e.target.value })} 
                                        style={{ ...modalInputStyle, padding: '0.9rem 1.2rem', borderRadius: '15px' }} 
                                    />
                                </div>
                            ))}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, opacity: 0.6, letterSpacing: '0.5px' }}>TIPO DE PERFIL</label>
                                <select 
                                    value={editingLead.interest_type || 'General'} 
                                    onChange={e => setEditingLead({...editingLead, interest_type: e.target.value})} 
                                    style={{ ...modalInputStyle, padding: '0.9rem 1.2rem', borderRadius: '15px' }}
                                >
                                    <option value="General">Interés General</option>
                                    <option value="Distribuidor">Distribuidor</option>
                                    <option value="Maquila">Maquila / Privado</option>
                                    <option value="Institucional">Institucional / Horeca</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setEditingLead(null)} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>CANCELAR</button>
                                <button 
                                    onClick={async () => { await updateLead(editingLead.id, editingLead); setEditingLead(null); }} 
                                    style={{ flex: 1.5, padding: '1.1rem', borderRadius: '16px', border: 'none', background: deepTeal, color: '#fff', fontWeight: '900', cursor: 'pointer', boxShadow: `0 10px 20px ${deepTeal}25` }}
                                >
                                    GUARDAR CAMBIOS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quotation Generator Modal */}
            {isQuotationModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '1100px', height: '90vh', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', position: 'relative', animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <button onClick={() => setIsQuotationModalOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '0.6rem', cursor: 'pointer', zIndex: 10, color: '#64748b' }}><X size={20} /></button>
                        
                        <div style={{ padding: '1.2rem 3rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: deepTeal }}>Generador de Cotización</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.3rem', fontSize: '0.85rem' }}>
                                    <p style={{ margin: 0, color: '#64748b' }}>Cliente: <span style={{ color: deepTeal, fontWeight: '700' }}>{isQuotationModalOpen.name}</span></p>
                                    <p style={{ margin: 0, color: '#64748b' }}>Tel: <span style={{ color: deepTeal, fontWeight: '700' }}>{isQuotationModalOpen.phone}</span></p>
                                    <p style={{ margin: 0, color: '#64748b' }}>Ciudad: <span style={{ color: deepTeal, fontWeight: '700' }}>{isQuotationModalOpen.city}</span></p>
                                    <p style={{ margin: 0, color: '#64748b' }}>Dirección: <span style={{ color: deepTeal, fontWeight: '700' }}>{isQuotationModalOpen.address}</span></p>
                                    <p style={{ margin: 0, color: '#64748b' }}>Email: <span style={{ color: deepTeal, fontWeight: '700' }}>{isQuotationModalOpen.email}</span></p>
                                    <p style={{ margin: 0, color: '#64748b' }}>V. Estimado: <span style={{ color: institutionOcre, fontWeight: '900' }}>{isQuotationModalOpen.estimated_volume}</span></p>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflow: 'hidden', padding: '1.2rem 3rem' }}>
                            {/* Product Selector */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: institutionOcre }}>CATÁLOGO DE PRODUCTOS</div>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar producto..." 
                                            value={quoteSearch}
                                            onChange={(e) => setQuoteSearch(e.target.value)}
                                            style={{ padding: '0.6rem 2rem 0.6rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none', width: '180px' }}
                                        />
                                        {quoteSearch && (
                                            <X 
                                                size={14} 
                                                onClick={() => setQuoteSearch('')} 
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer', background: '#f8fafc', borderRadius: '50%' }} 
                                            />
                                        )}
                                    </div>
                                </div>
                                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                                    {masterProducts
                                        .filter(p => (p.type === 'product' || p.category === 'Producto Terminado' || p.category === 'PT') && !p.name.includes('(MP)'))
                                        .filter(p => !quoteSearch || p.name.toLowerCase().includes(quoteSearch.toLowerCase()))
                                        .map(product => (
                                            <div key={product.id} style={{ padding: '1.2rem', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: deepTeal }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>${Number(product.price || 0).toLocaleString()}</div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const exists = quoteItems.find(i => i.id === product.id);
                                                        if (exists) {
                                                            setQuoteItems(quoteItems.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
                                                        } else {
                                                            setQuoteItems([...quoteItems, { ...product, id: product.id || product.item_id, price: product.price, name: product.name, unit: product.unit || product.unit_measure, qty: 1 }]);
                                                        }
                                                    }}
                                                    style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', background: deepTeal, color: '#fff', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}
                                                >
                                                    Añadir
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Selection Summary */}
                            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '25px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '1rem', color: deepTeal }}>RESUMEN DE COTIZACIÓN</div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {quoteItems.map(item => (
                                        <div key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.85rem', maxWidth: '80%' }}>{item.name}</div>
                                                <button 
                                                    onClick={() => setQuoteItems(quoteItems.filter(qi => qi.id !== item.id))}
                                                    style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '2px' }}>
                                                    <button onClick={() => setQuoteItems(quoteItems.map(qi => qi.id === item.id ? { ...qi, qty: Math.max(1, qi.qty - 1) } : qi))} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                                                    <input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => {
                                                            const n = parseInt(e.target.value) || 1;
                                                            setQuoteItems(quoteItems.map(qi => qi.id === item.id ? { ...qi, qty: n } : qi));
                                                        }}
                                                        style={{ width: '40px', padding: '4px', textAlign: 'center', border: 'none', outline: 'none', fontWeight: '700', fontSize: '0.8rem' }}
                                                    />
                                                    <button onClick={() => setQuoteItems(quoteItems.map(qi => qi.id === item.id ? { ...qi, qty: qi.qty + 1 } : qi))} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>x ${(item.price || 0).toLocaleString()}</span>
                                                <span style={{ marginLeft: 'auto', fontWeight: '800', color: deepTeal }}>${(item.price * item.qty).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '1.5rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                        <span>SUBTOTAL:</span>
                                        <strong style={{ color: deepTeal }}>${quoteItems.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Truck size={12} /> ENVÍO ({isQuotationModalOpen.city}):
                                        </div>
                                        <span>${getShippingCost(isQuotationModalOpen.city, quoteItems.reduce((s, i) => s + (i.price * i.qty), 0)).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>VALIDEZ:</span>
                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>(Días)</span>
                                        </div>
                                        <select 
                                            value={quoteValidity}
                                            onChange={(e) => setQuoteValidity(e.target.value)}
                                            style={{ border: '1px solid #ddd', padding: '2px 6px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', background: '#fff' }}
                                        >
                                            <option value={7}>7 días</option>
                                            <option value={15}>15 días</option>
                                            <option value={30}>30 días</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>DESCUENTO:</span>
                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>(%)</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="0.00"
                                                value={quoteDiscount} 
                                                onChange={(e) => setQuoteDiscount(parseFloat(e.target.value) || 0)} 
                                                style={{ width: '50px', textAlign: 'right', border: '1px solid #ddd', padding: '2px 6px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem' }} 
                                            />
                                            <span style={{ fontWeight: '800', color: '#64748b' }}>%</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginBottom: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        <span>AHORRO:</span>
                                        <span>-${(Math.round(((quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) * quoteDiscount) / 100) / 100) * 100).toLocaleString()}</span>
                                    </div>
                                    <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '900', color: deepTeal }}>
                                        <span>TOTAL:</span>
                                        <span>
                                            ${(Math.round((
                                                quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) + 
                                                getShippingCost(isQuotationModalOpen.city, quoteItems.reduce((s, i) => s + (i.price * i.qty), 0)) - 
                                                (quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) * quoteDiscount / 100)
                                            ) / 100) * 100).toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        disabled={quoteItems.length === 0}
                                        onClick={() => {
                                            if (!isQuotationModalOpen.city || !isQuotationModalOpen.address) {
                                                alert("Faltan datos de CIUDAD y DIRECCIÓN en el cliente. Por favor completa los Datos Maestros primero.");
                                                return;
                                            }
                                            generatePDF(isQuotationModalOpen, quoteItems, quoteDiscount);
                                            setIsQuotationModalOpen(false);
                                        }}
                                        style={{ width: '100%', background: institutionOcre, color: '#fff', border: 'none', borderRadius: '12px', padding: '0.8rem', fontWeight: '900', cursor: quoteItems.length === 0 ? 'not-allowed' : 'pointer', opacity: quoteItems.length === 0 ? 0.5 : 1, fontSize: '0.85rem' }}
                                    >
                                        GENERAR COTIZACIÓN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow-up / Task Modal */}
            {isFollowUpModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', width: '450px', borderRadius: '35px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <button onClick={() => setIsFollowUpModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        <h3 style={{ margin: '0 0 1rem 0', fontWeight: '900', color: deepTeal }}>Programar Seguimiento</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Define una fecha y motivo para contactar a {isFollowUpModalOpen.name}.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '900', color: deepTeal }}>FECHA DE SEGUIMIENTO</label>
                            <input type="date" value={isFollowUpModalOpen.follow_up_date || ''} onChange={(e) => setIsFollowUpModalOpen({ ...isFollowUpModalOpen, follow_up_date: e.target.value })} style={modalInputStyle} />
                            <label style={{ fontSize: '0.8rem', fontWeight: '900', color: deepTeal }}>MOTIVO / TAREA</label>
                            <textarea value={isFollowUpModalOpen.follow_up_note || ''} onChange={(e) => setIsFollowUpModalOpen({ ...isFollowUpModalOpen, follow_up_note: e.target.value })} placeholder="Ej: Llamar para confirmar recibo de catálogo" style={{ ...modalInputStyle, height: '100px', resize: 'none' }} />
                            <button onClick={async () => { await updateLead(isFollowUpModalOpen.id, { follow_up_date: isFollowUpModalOpen.follow_up_date, follow_up_note: isFollowUpModalOpen.follow_up_note, task_completed: false }); setIsFollowUpModalOpen(false); }} style={{ padding: '1.2rem', borderRadius: '15px', border: 'none', background: institutionOcre, color: '#fff', fontWeight: '900', cursor: 'pointer', marginTop: '1rem', boxShadow: `0 10px 20px ${institutionOcre}30` }}>Sincronizar Tarea</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Lead Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '540px', borderRadius: '40px', padding: '3.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', position: 'relative', animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', margin: '2rem' }}>
                        <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: '#f8fafc', border: 'none', borderRadius: '50%', padding: '0.6rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={20} /></button>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '900', color: deepTeal, fontSize: '2rem', letterSpacing: '-1px' }}>Nuevo Prospecto</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2.5rem', fontWeight: '500' }}>Inicia el ciclo comercial registrando un nuevo contacto.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>NOMBRE</label>
                                    <input type="text" placeholder="Ej: Juan Pérez" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} style={modalInputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>WHATSAPP / TEL</label>
                                    <input type="text" placeholder="300..." value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} style={modalInputStyle} />
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>EMAIL</label>
                                <input type="email" placeholder="contacto@empresa.com" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} style={modalInputStyle} />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>CIUDAD</label>
                                    <input 
                                        type="text" 
                                        list="cities-list"
                                        placeholder="Bogotá, etc." 
                                        value={newLead.city} 
                                        onChange={e => setNewLead({...newLead, city: e.target.value})} 
                                        style={modalInputStyle} 
                                    />
                                    <datalist id="cities-list">
                                        {colombia_cities.map((c, i) => (
                                            <option key={i} value={c.city}>{c.state}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>TIPO DE PERFIL</label>
                                    <select value={newLead.interest_type} onChange={e => setNewLead({...newLead, interest_type: e.target.value})} style={modalInputStyle}>
                                        <option value="General">Interés General</option>
                                        <option value="Distribuidor">Distribuidor</option>
                                        <option value="Maquila">Maquila / Privado</option>
                                        <option value="Institucional">Institucional / Horeca</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '900', color: deepTeal, paddingLeft: '0.5rem' }}>NOTAS / VOLUMEN</label>
                                <textarea placeholder="Ej: Interés en 100 frascos de mermelada mensual." value={newLead.estimated_volume} onChange={e => setNewLead({...newLead, estimated_volume: e.target.value})} style={{ ...modalInputStyle, height: '90px', resize: 'none' }} />
                            </div>
                            
                            <button 
                                onClick={handleCreateLead}
                                style={{ 
                                    padding: '1.4rem', 
                                    borderRadius: '22px', 
                                    border: 'none', 
                                    background: `linear-gradient(135deg, ${deepTeal}, #037075)`, 
                                    color: '#fff', 
                                    fontWeight: '900', 
                                    fontSize: '1rem',
                                    cursor: 'pointer', 
                                    marginTop: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: '0 15px 30px rgba(2, 54, 54, 0.3)',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Zap size={22} fill="#fff" /> EMPRENDER SEGUIMIENTO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .lead-card-hover:hover { transform: translateY(-4px); border-color: ${institutionOcre}40 !important; box-shadow: 0 12px 25px rgba(0,0,0,0.05) !important; }
                ::-webkit-scrollbar { height: 8px; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                
                /* CRM Kanban Board Responsive Grid */
                .crm-kanban-board {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    flex: 1;
                    padding-bottom: 2rem;
                    align-items: flex-start;
                }
                
                @media (max-width: 1200px) {
                    .crm-kanban-board {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    }
                }
                
                @media (max-width: 768px) {
                    .crm-kanban-board {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            {/* PDF Preview Modal */}
            {isPdfModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: '1rem' }}>
                    <div style={{ background: '#fff', width: '95%', maxWidth: '1000px', height: '95vh', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
                        <iframe 
                            src={`${pdfPreviewUrl}#toolbar=0`} 
                            style={{ flex: 1, border: 'none', background: '#f1f5f9' }} 
                            title="PDF Preview"
                        />
                        <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={() => {
                                        if (!currentQuoteLead) return;
                                        const doc = generatePDF(currentQuoteLead, quoteItems, quoteDiscount, true);
                                        doc.save(`Cotizacion_Zeticas_${currentQuoteLead.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
                                    }} 
                                    style={{ padding: '1.1rem 2rem', borderRadius: '16px', border: 'none', background: institutionOcre, color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 10px 20px ${institutionOcre}30` }}
                                >
                                    <Download size={18} /> DESCARGAR PDF
                                </button>
                                <button 
                                    onClick={() => {
                                        if (!currentQuoteLead) return;
                                        const quoteTotal = Math.round((quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) + getShippingCost(currentQuoteLead.city, quoteItems.reduce((s, i) => s + (i.price * i.qty), 0)) - (quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) * quoteDiscount / 100)) / 100) * 100;
                                        const cleanPhone = (currentQuoteLead.phone || '').replace(/\D/g, '');
                                        const messageText = `Hola ${currentQuoteLead.name}, te saludo de Zeticas 🌿. Te adjunto la cotización formal por un total de $${quoteTotal.toLocaleString()} (incluye envío a ${currentQuoteLead.city}). Quedamos atentos a tu confirmación.`;
                                        const waLink = `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(messageText)}`;
                                        window.open(waLink, '_blank');
                                    }} 
                                    style={{ padding: '1.1rem 2rem', borderRadius: '16px', border: 'none', background: '#25D366', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)' }}
                                >
                                    <Phone size={18} /> ENVIAR POR WHATSAPP
                                </button>
                                <button 
                                    onClick={() => {
                                        if (!currentQuoteLead) return;
                                        const quoteTotal = Math.round((quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) + getShippingCost(currentQuoteLead.city, quoteItems.reduce((s, i) => s + (i.price * i.qty), 0)) - (quoteItems.reduce((s, i) => s + (i.price * i.qty), 0) * quoteDiscount / 100)) / 100) * 100;
                                        const subject = `Cotización Comercial - Zeticas - ${currentQuoteLead.name}`;
                                        const body = `Hola ${currentQuoteLead.name},\n\nEs un gusto saludarte de Zeticas 🌿.\n\nAdjuntamos la cotización de los productos solicitados por un total de $${quoteTotal.toLocaleString()} (incluye flete a ${currentQuoteLead.city}).\n\nQuedamos atentos a tus comentarios para proceder con el despacho.\n\nAtentamente,\nEquipo Zeticas`;
                                        const mailLink = `mailto:${currentQuoteLead.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        window.location.href = mailLink;
                                    }} 
                                    style={{ padding: '1.1rem 2rem', borderRadius: '16px', border: 'none', background: '#334155', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(51, 65, 85, 0.2)' }}
                                >
                                    <Mail size={18} /> ENVIAR POR EMAIL
                                </button>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsPdfModalOpen(false);
                                    setCurrentQuoteLead(null);
                                }} 
                                style={{ padding: '1.1rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}
                            >
                                CERRAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalInputStyle = {
    width: '100%',
    padding: '1.1rem 1.5rem',
    borderRadius: '18px',
    border: '1px solid #f1f5f9',
    background: '#f8fafc',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s focus'
};

export default CRM;


