import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit3, Trash2, X, AlertCircle, Barcode } from 'lucide-react';

const Products = () => {
    // Initial data from Excel (simulated persistence with local state)
    const [productsList, setProductsList] = useState([
        { id: 1, sku: 'SAL-HUM-100', name: 'Hummus de Garbanzo', category: 'Sal', price: 21000, cost: 4498, stock: 88, unit: 'Frasco 240g', hasMovements: true },
        { id: 2, sku: 'SAL-ANT-101', name: 'Antipasto tuna', category: 'Sal', price: 35000, cost: 11537, stock: 86, unit: 'Frasco 240g', hasMovements: true },
        { id: 3, sku: 'SAL-VIN-102', name: 'Vinagreta', category: 'Sal', price: 18000, cost: 3168, stock: 29, unit: 'Frasco 240g', hasMovements: false },
        { id: 4, sku: 'SAL-ANT-103', name: 'Antipasto Veggie', category: 'Sal', price: 20000, cost: 8385, stock: 74, unit: 'Frasco 240g', hasMovements: true },
        { id: 5, sku: 'SAL-BER-104', name: 'Berenejena Toscana', category: 'Sal', price: 17000, cost: 7440, stock: 50, unit: 'Frasco 240g', hasMovements: false },
        { id: 6, sku: 'SAL-BER-105', name: 'Berenjenas para untar', category: 'Sal', price: 24000, cost: 14515, stock: 12, unit: 'Frasco 240g', hasMovements: false },
        { id: 7, sku: 'SAL-ZET-106', name: 'Zetas griegas', category: 'Sal', price: 24000, cost: 10504, stock: 22, unit: 'Frasco 240g', hasMovements: false },
        { id: 8, sku: 'SAL-PEP-107', name: 'Pepinillos', category: 'Sal', price: 10000, cost: 3913, stock: 10, unit: 'Frasco 240g', hasMovements: false },
        { id: 9, sku: 'SAL-HAB-108', name: 'Habas para untar', category: 'Sal', price: 20000, cost: 8661, stock: 5, unit: 'Frasco 240g', hasMovements: false },
        { id: 10, sku: 'SAL-JAL-109', name: 'Jalea Pimentón', category: 'Sal', price: 24000, cost: 8353, stock: 9, unit: 'Frasco 240g', hasMovements: false },
        { id: 11, sku: 'SAL-BAL-110', name: 'Balu & Alcachofa', category: 'Sal', price: 18000, cost: 15927, stock: 49, unit: 'Frasco 240g', hasMovements: false },
        { id: 12, sku: 'SAL-PES-111', name: 'Pesto kale', category: 'Sal', price: 24000, cost: 7010, stock: 43, unit: 'Frasco 240g', hasMovements: false },
        { id: 13, sku: 'DUL-PON-112', name: 'Ponqué Navidad', category: 'Dulce', price: 22944, cost: 9500, stock: 64, unit: 'Frasco 240g', hasMovements: false },
        { id: 14, sku: 'DUL-NID-113', name: 'Nidos de nuez', category: 'Dulce', price: 2102, cost: 1200, stock: 68, unit: 'Frasco 240g', hasMovements: false },
        { id: 15, sku: 'DUL-FLO-114', name: 'Florentinas', category: 'Dulce', price: 2366, cost: 1450, stock: 93, unit: 'Frasco 240g', hasMovements: false },
        { id: 16, sku: 'DUL-CUP-115', name: 'Cupcakes Zanahoria & Naranja', category: 'Dulce', price: 1503, cost: 850, stock: 39, unit: 'Frasco 240g', hasMovements: false },
        { id: 17, sku: 'DUL-CUP-116', name: 'Cupcakes Choco', category: 'Dulce', price: 877, cost: 500, stock: 66, unit: 'Frasco 240g', hasMovements: false },
        { id: 18, sku: 'DUL-ARR-117', name: 'Arroz Cocomilk', category: 'Dulce', price: 5445, cost: 2200, stock: 62, unit: 'Frasco 240g', hasMovements: false },
        { id: 19, sku: 'DUL-MER-118', name: 'Mermelada Ruibarbo Fresa', category: 'Dulce', price: 2607, cost: 1100, stock: 23, unit: 'Frasco 240g', hasMovements: false },
        { id: 20, sku: 'DUL-DUL-119', name: 'Dulce Silvia', category: 'Dulce', price: 2008, cost: 900, stock: 54, unit: 'Frasco 240g', hasMovements: false },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, product: null, error: '' });
    const [barcodeModal, setBarcodeModal] = useState({ show: false, product: null });

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: 'Sal',
        price: '',
        cost: '',
        stock: '',
        unit: 'Frasco 240g'
    });

    const filteredProducts = productsList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                category: 'Sal',
                price: '',
                cost: '',
                stock: '',
                unit: 'Frasco 240g'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Block negative values for numeric fields
        if (['price', 'cost', 'stock'].includes(name)) {
            const numValue = parseFloat(value);
            if (numValue < 0) {
                setFormData({ ...formData, [name]: '0' });
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSave = (e) => {
        e.preventDefault();

        const price = parseFloat(formData.price);
        const cost = parseFloat(formData.cost);
        const stock = parseInt(formData.stock);

        if (price < 0 || cost < 0 || stock < 0) {
            alert('El precio, el costo y el stock no pueden ser valores negativos.');
            return;
        }

        const data = {
            ...formData,
            id: editingProduct ? editingProduct.id : Date.now(),
            price,
            cost,
            stock,
            hasMovements: editingProduct ? editingProduct.hasMovements : false
        };

        if (editingProduct) {
            setProductsList(productsList.map(p => p.id === editingProduct.id ? data : p));
        } else {
            setProductsList([...productsList, data]);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (product) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar este producto?")) {
            return;
        }

        if (product.hasMovements) {
            alert(`No se puede eliminar "${product.name}" porque tiene movimientos históricos vinculados (Ventas, Compras o Inventario).`);
        } else {
            setProductsList(productsList.filter(p => p.id !== product.id));
        }
    };

    return (
        <div className="products-module">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Productos / SKU</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Gestión de catálogo técnico y perfiles de costos.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn"
                    style={{ background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Nuevo SKU
                </button>
            </header>

            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid #ddd', outline: 'none' }}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '0.6rem 2rem 0.6rem 1rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="Todos">Todas las Categorías</option>
                    <option value="Sal">Sal</option>
                    <option value="Dulce">Dulce</option>
                </select>
            </div>

            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fafafa', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>SKU</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Producto</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Categoría</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Precio Venta</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Costo Base</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Margen</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Stock</th>
                            <th style={{ padding: '1rem', fontSize: '0.85rem', background: '#fafafa', position: 'sticky', top: 0 }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '0.85rem', color: '#666' }}>{p.sku}</td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '500' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{p.unit}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: p.category === 'Sal' ? '#e3f2fd' : '#f3e5f5' }}>{p.category}</span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>${p.price.toLocaleString()}</td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>${p.cost.toLocaleString()}</td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-sage)', fontWeight: 'bold' }}>
                                    {p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{p.stock}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setBarcodeModal({ show: true, product: p })}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-sage)' }}
                                            title="Ver Código de Barras"
                                        >
                                            <Barcode size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(p)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(p)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4d' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            {editingProduct ? 'Editar Producto' : 'Nuevo SKU'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Categoría</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                                        <option value="Sal">Sal</option>
                                        <option value="Dulce">Dulce</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Nombre del Producto</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Precio</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Costo</label>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Stock</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>Unidad / Presentación</label>
                                <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                            </div>
                            <button type="submit" className="btn" style={{ background: 'var(--color-primary)', color: '#fff', marginTop: '1rem', padding: '0.8rem' }}>
                                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Barcode */}
            {barcodeModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                    <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3 className="font-serif" style={{ fontSize: '1.4rem', color: 'var(--color-primary)', margin: 0 }}>Código de Barras</h3>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>{barcodeModal.product?.name}</p>
                            </div>
                            <button onClick={() => setBarcodeModal({ show: false, product: null })} style={{ border: 'none', background: '#f5f5f5', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ background: '#fff', padding: '2rem', border: '1px dashed #ccc', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            {/* Barcode representation using an API for high-quality Code128 */}
                            <img
                                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcodeModal.product?.sku || ('ZT' + barcodeModal.product?.id.toString().padStart(6, '0'))}&scale=2&rotate=N&includetext`}
                                alt="Barcode"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />

                            <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                                SKU: {barcodeModal.product?.sku}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={() => window.print()}
                                className="btn"
                                style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.7rem' }}
                            >
                                Imprimir Ticket
                            </button>
                            <button
                                onClick={() => setBarcodeModal({ show: false, product: null })}
                                className="btn"
                                style={{ background: '#f5f5f5', color: '#333', padding: '0.7rem' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
