import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([
        { id: 1, name: 'Frasco 240g Vidrio', type: 'material', initial: 1000, purchases: 350, sales: 150, safety: 400, unit: 'und', group: 'Empaque', avgCost: 1200 },
        { id: 2, name: 'Tapa Dorada', type: 'material', initial: 1200, purchases: 400, sales: 100, safety: 400, unit: 'und', group: 'Empaque', avgCost: 450 },
        { id: 3, name: 'Berenjenas (Materia Prima)', type: 'material', initial: 80, purchases: 20, sales: 55, safety: 45, unit: 'kg', group: 'Verduras', avgCost: 3500 },
        { id: 4, name: 'Aceite de Oliva Premium', type: 'material', initial: 12, purchases: 5, sales: 10, safety: 15, unit: 'lt', group: 'Aditivos', avgCost: 32000 },
        { id: 5, name: 'Azúcar Blanca', type: 'material', initial: 50, purchases: 10, sales: 20, safety: 30, unit: 'kg', group: 'Aditivos', avgCost: 3800 },
        { id: 6, name: 'Vinagre Blanco', type: 'material', initial: 20, purchases: 5, sales: 8, safety: 15, unit: 'lt', group: 'Aditivos', avgCost: 4500 },
        { id: 7, name: 'Caja Corrugada', type: 'material', initial: 500, purchases: 0, sales: 100, safety: 200, unit: 'und', group: 'Cajas', avgCost: 800 },
        { id: 8, name: 'Alcachofas (Materia Prima)', type: 'material', initial: 30, purchases: 10, sales: 20, safety: 20, unit: 'kg', group: 'Verduras', avgCost: 12000 },
        { id: 9, name: 'Atún Ahumado', type: 'material', initial: 10, purchases: 5, sales: 8, safety: 5, unit: 'kg', group: 'Proteínas', avgCost: 25000 },
        { id: 10, name: 'Pimentón', type: 'material', initial: 25, purchases: 10, sales: 15, safety: 15, unit: 'kg', group: 'Verduras', avgCost: 4500 },
        { id: 11, name: 'Zetas', type: 'material', initial: 15, purchases: 5, sales: 10, safety: 15, unit: 'kg', group: 'Verduras', avgCost: 8000 },

        { id: 101, name: 'Berenjena Toscana', type: 'product', initial: 25, purchases: 0, sales: 13, safety: 20, unit: 'und', group: 'Sal', avgCost: 0, unitsPerBox: 12, barcode: 'ZT003001.gif', price: 30000 },
        { id: 102, name: 'Dulce Silvia', type: 'product', initial: 15, purchases: 0, sales: 7, safety: 15, unit: 'und', group: 'Dulce', avgCost: 0, unitsPerBox: 6, barcode: 'ZT001502.gif', price: 28000 },
        { id: 103, name: 'Ruibarbo & Fresa', type: 'product', initial: 60, purchases: 0, sales: 15, safety: 30, unit: 'und', group: 'Dulce', avgCost: 0, unitsPerBox: 6, barcode: 'ZT002006.gif', price: 32000 },
    ]);

    const [recipes] = useState({
        'Vinagreta Migalaba': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 4, qty: 0.1 }, { id: 6, qty: 0.2 }],
        'Dip Alcachofas': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 8, qty: 0.3 }, { id: 4, qty: 0.05 }],
        'Antipasto Atún Ahumado': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 9, qty: 0.2 }, { id: 4, qty: 0.1 }],
        'Jalea Pimentón y Ají': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 10, qty: 0.4 }, { id: 5, qty: 0.2 }],
        'Berenjena Toscana': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 3, qty: 0.5 }, { id: 4, qty: 0.1 }],
        'Dulce Silvia': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 5, qty: 0.3 }],
        'Ruibarbo & Fresa': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 5, qty: 0.3 }],
        'Pesto Kale': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 4, qty: 0.15 }],
        'Zetas Griegas': [{ id: 1, qty: 1 }, { id: 2, qty: 1 }, { id: 11, qty: 0.3 }, { id: 4, qty: 0.1 }]
    });

    const [providers] = useState([
        { id: 'PROV-001', name: 'Vidrios de Colombia', group: 'Empaque' },
        { id: 'PROV-002', name: 'Corrugados Nacionales', group: 'Cajas' },
        { id: 'PROV-003', name: 'Fruver Sabana', group: 'Verduras' },
        { id: 'PROV-004', name: 'Salsas y Sabores', group: 'Aditivos' },
        { id: 'PROV-005', name: 'Pesquera del Pacífico', group: 'Proteínas' }
    ]);

    const [orders, setOrders] = useState([
        {
            id: 'WEB-251',
            client: 'Maria Camila Gomez',
            amount: 128500,
            date: '2026-03-12',
            status: 'Pendiente',
            source: 'Pagina WEB',
            items: [
                { id: 101, name: 'Berenjena Toscana', quantity: 2, price: 30000 },
                { id: 102, name: 'Dulce Silvia', quantity: 1, price: 36500 },
                { id: 103, name: 'Ruibarbo & Fresa', quantity: 1, price: 32000 }
            ]
        },
        {
            id: 'WEB-4822',
            client: 'Maria Camila Gomez',
            amount: 173000,
            date: '2026-03-12',
            status: 'Pendiente',
            source: 'Pagina WEB',
            items: [
                { id: 101, name: 'Berenjena Toscana', quantity: 4, price: 30000 },
                { id: 102, name: 'Dulce Silvia', quantity: 1, price: 21000 },
                { id: 103, name: 'Ruibarbo & Fresa', quantity: 1, price: 32000 }
            ]
        },
        {
            id: 'REC-7484',
            client: 'Prueba 1',
            amount: 191000,
            date: '2026-03-12',
            status: 'Pendiente',
            source: 'Cliente Recurrente',
            items: [
                { id: 101, name: 'Berenjena Toscana', quantity: 3, price: 30000 },
                { id: 102, name: 'Dulce Silvia', quantity: 2, price: 28000 },
                { id: 103, name: 'Ruibarbo & Fresa', quantity: 1, price: 45000 }
            ]
        },
        {
            id: 'FAC-001',
            client: 'Restaurante Masa',
            amount: 1250000,
            date: '2024-02-14',
            status: 'Entregado',
            source: 'Distribuidores',
            items: [
                { id: 101, name: 'Berenjena Toscana', quantity: 50, price: 25000 }
            ]
        },
        {
            id: 'ORD-542',
            client: 'Andrés López',
            amount: 85000,
            date: '2024-02-15',
            status: 'Pendiente',
            source: 'Pagina WEB',
            items: [
                { id: 102, name: 'Dulce Silvia', quantity: 2, price: 22000 },
                { id: 103, name: 'Ruibarbo & Fresa', quantity: 1, price: 41000 }
            ]
        }
    ]);

    const [expenses, setExpenses] = useState([
        { id: 1, date: '2024-02-01', category: 'Administración', description: 'Arriendo Oficina', amount: 2500000, bank: 'Bancolombia' },
        { id: 2, date: '2024-02-05', category: 'Ventas', description: 'Publicidad Meta', amount: 800000, bank: 'Wompi' }
    ]);

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [banks, setBanks] = useState([]);

    const [taxSettings, setTaxSettings] = useState({
        iva: 19,
        retefuente: 2.5,
        ica: 9.6,
        renta: 35
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Inventory
                const { data: invData, error: invError } = await supabase.from('inventory').select('*');
                if (!invError && invData?.length > 0) {
                    setItems(invData.map(item => ({
                        ...item,
                        group: item.inventory_group // Map from DB column name
                    })));
                }

                // Fetch Banks
                const { data: bankData, error: bankError } = await supabase.from('banks').select('*');
                if (!bankError && bankData?.length > 0) {
                    setBanks(bankData);
                }

                // Fetch Orders (including items if needed, but for now just orders)
                const { data: ordData, error: ordError } = await supabase.from('orders').select('*, order_items(*)');
                if (!ordError && ordData?.length > 0) {
                    setOrders(ordData.map(o => ({
                        id: o.id,
                        client: o.client_name,
                        amount: o.total_amount,
                        date: o.order_date,
                        status: o.status,
                        source: o.source,
                        items: o.order_items.map(oi => ({
                            id: oi.product_id,
                            name: oi.product_name,
                            quantity: oi.quantity,
                            price: oi.unit_price
                        }))
                    })));
                }
            } catch (err) {
                console.log("Supabase tables not ready yet, using local data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addOrder = async (order) => {
        // Optimistic update
        setOrders(prev => [order, ...prev]);

        // Persist to Supabase
        try {
            const { error: ordError } = await supabase.from('orders').insert({
                id: order.id,
                client_name: order.client,
                total_amount: order.amount,
                order_date: order.date,
                status: order.status,
                source: order.source
            });

            if (!ordError && order.items?.length > 0) {
                const itemsToInsert = order.items.map(item => ({
                    order_id: order.id,
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    unit_price: item.price
                }));
                await supabase.from('order_items').insert(itemsToInsert);
            }
        } catch (err) {
            console.error("Error persisting order to Supabase:", err);
        }
    };

    return (
        <BusinessContext.Provider value={{
            items, setItems,
            orders, setOrders,
            expenses, setExpenses,
            purchaseOrders, setPurchaseOrders,
            banks, setBanks,
            taxSettings, setTaxSettings,
            recipes, providers,
            addOrder,
            loading
        }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => useContext(BusinessContext);
