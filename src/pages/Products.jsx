import React, { useState } from 'react';
import { Package, Plus, Search, Edit3, Trash2, X, Barcode, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBusiness } from '../context/BusinessContext';

const Products = () => {
    const { items, refreshData, loading } = useBusiness();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, target: null, title: '', message: '' });
    const [barcodeModal, setBarcodeModal] = useState({ show: false, product: null });

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: 'Sal',
        price: '',
        cost: '',
        stock: '',
        unit_measure: 'unidad',
        type: 'PT'
    });

    const productsList = items.map(i => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        category: i.group || 'Otros',
        price: i.price || 0,
        cost: i.avgCost || 0,
        stock: i.initial || 0,
        unit_measure: i.unit || 'unidad',
        type: i.type === 'product' ? 'PT' : 'MP'
    }));

    const filteredProducts = productsList.filter(p => {
        const matchesSearch = (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setFormData({ sku: '', name: '', category: 'Sal', price: '', cost: '', stock: '0', unit_measure: 'unidad', type: 'PT' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = {
            sku: formData.sku,
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price) || 0,
            cost: parseFloat(formData.cost) || 0,
            stock: parseInt(formData.stock) || 0,
            unit_measure: formData.unit_measure,
            type: formData.type
        };

        try {
            if (editingProduct) {
                await supabase.from('products').update(data).eq('id', editingProduct.id);
            } else {
                await supabase.from('products').insert([data]);
            }
            await refreshData();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving product:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const executeDeletion = async () => {
        try {
            await supabase.from('products').delete().eq('id', confirmModal.target.id);
            await refreshData();
            setConfirmModal({ show: false, target: null, title: '', message: '' });
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Error al eliminar. Verifique si el producto está en uso.");
        }
    };

    return (
        <div className="products-module" style={{ padding: '0 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', margin: 0 }}>Maestro de Productos (Nube)</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Gestión centralizada de SKU y costos maestros.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={refreshData} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer' }}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    <button onClick={() => handleOpenModal()} style={{ background: 'var(--color-secondary)', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Nuevo SKU
                    </button>
                </div>
            </header>

            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input placeholder="Buscar en la nube..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </div>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 'bold' }}>
                    <option value="Todos">Categorías</option>
                    <option value="Sal">Sal</option>
                    <option value="Dulce">Dulce</option>
                    <option value="Insumos">Insumos</option>
                </select>
            </div>

            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.7rem' }}>SKU</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.7rem' }}>PRODUCTO</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.7rem' }}>CATEGORÍA</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.7rem' }}>PRECIO</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.7rem' }}>COSTO</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center', fontSize: '0.7rem' }}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '0.85rem' }}>{p.sku}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{p.unit_measure}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{p.category}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>${p.price?.toLocaleString()}</td>
                                <td style={{ padding: '1rem', color: '#666' }}>${p.cost?.toLocaleString()}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button onClick={() => setBarcodeModal({ show: true, product: p })} style={{ padding: '0.4rem', border: '1px solid #eee', background: 'none', cursor: 'pointer' }}><Barcode size={14} /></button>
                                        <button onClick={() => handleOpenModal(p)} style={{ padding: '0.4rem', border: '1px solid #eee', background: 'none', cursor: 'pointer' }}><Edit3 size={14} /></button>
                                        <button onClick={() => setConfirmModal({ show: true, target: p, title: 'Eliminar SKU', message: '¿Eliminar permanentemente?' })} style={{ padding: '0.4rem', border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '500px' }}>
                        <h3>{editingProduct ? 'Editar SKU' : 'Nuevo SKU'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <input placeholder="SKU" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                            <input placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input placeholder="Precio" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                                <input placeholder="Costo" type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #ddd' }} />
                            </div>
                            <button type="submit" disabled={isSaving} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 'bold' }}>
                                {isSaving ? 'Guardando...' : 'Guardar SKU'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Products;
