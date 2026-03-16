import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { products as masterProducts } from '../data/products';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const [recipes, setRecipes] = useState({});
    const [providers, setProviders] = useState([]);

    const [orders, setOrders] = useState([]);

    const [expenses, setExpenses] = useState([]);

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [banks, setBanks] = useState([]);

    const [taxSettings, setTaxSettings] = useState({
        iva: 19,
        retefuente: 2.5,
        ica: 9.6,
        renta: 35
    });

    const [clients, setClients] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    const refreshData = async () => {
        try {
            // 1. Fetch Products (Inventory)
            const { data: prodData, error: prodError } = await supabase.from('products').select('*');
            if (!prodError && prodData?.length > 0) {
                const synchronizedItems = prodData.map(p => {
                    let price = p.price || 0;

                    // Sincronización con Data Maestra (products.js)
                    if (price === 0 || price === null) {
                        const normalizedDbName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');

                        // Mapeos manuales para nombres comunes que varían
                        const manualMappings = {
                            'vinagreta': 'vinagretamigalaba',
                            'antipastotuna': 'antipastoatunahumado',
                            'hummusdegarbanzo': 'hummusdegarbanzo'
                        };

                        const targetName = manualMappings[normalizedDbName] || normalizedDbName;

                        const masterMatch = masterProducts.find(mp =>
                            mp.nombre.toLowerCase().replace(/[^a-z0-9]/g, '') === targetName
                        );

                        if (masterMatch) {
                            price = masterMatch.precio;
                        }
                    }

                    return {
                        id: p.id,
                        name: p.name,
                        type: p.type === 'PT' ? 'product' : 'material',
                        initial: p.stock || 0,
                        purchases: 0,
                        sales: 0,
                        safety: p.min_stock_level || 0,
                        unit: p.unit_measure,
                        group: p.category || 'Otros',
                        avgCost: p.cost || 0,
                        price: price,
                        sku: p.sku
                    };
                });
                setItems(synchronizedItems);
            }

            // 2. Fetch Banks
            const { data: bankData, error: bankError } = await supabase.from('banks').select('*');
            if (!bankError && bankData?.length > 0) {
                setBanks(bankData);
            }

            // 3. Fetch Orders with Items and Clients
            const { data: ordData, error: ordError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items(*, products(name)),
                    clients(name)
                `)
                .order('created_at', { ascending: false });

            if (!ordError && ordData?.length > 0) {
                setOrders(ordData.map(o => ({
                    id: o.order_number || o.id,
                    dbId: o.id,
                    client: o.clients?.name || 'Cliente Desconocido',
                    amount: o.total_amount,
                    date: o.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                    status: o.status,
                    source: o.source,
                    items: (o.order_items || []).map(oi => ({
                        id: oi.product_id,
                        name: oi.products?.name || 'Producto',
                        quantity: oi.quantity || 0,
                        price: oi.unit_price || 0
                    }))
                })));
            }

            // 3.5. Fetch Recipes and Providers
            const { data: recData } = await supabase.from('recipes').select('*, products!finished_good_id(name, sku), raw:products!raw_material_id(id, name, sku)');
            if (recData) {
                const groupedRecipes = {};
                recData.forEach(r => {
                    const fgName = r.products?.name;
                    if (!fgName) return;
                    if (!groupedRecipes[fgName]) groupedRecipes[fgName] = [];
                    groupedRecipes[fgName].push({
                        id: r.raw?.id,
                        name: r.raw?.name,
                        sku: r.raw?.sku,
                        qty: r.quantity_required
                    });
                });
                setRecipes(groupedRecipes);
            }

            const { data: provData } = await supabase.from('suppliers').select('*');
            if (provData) {
                setProviders(provData.map(p => ({
                    id: p.id,
                    name: p.name,
                    group: p.category || 'General',
                    phone: p.phone,
                    email: p.email
                })));
            }

            // 4. Fetch Purchases (Purchase Orders)
            const { data: purData, error: purError } = await supabase
                .from('purchases')
                .select(`
                    *,
                    purchase_items(*, products(name, type)),
                    suppliers(name)
                `);

            if (!purError && purData?.length > 0) {
                setPurchaseOrders(purData.map(p => ({
                    id: p.po_number || p.id,
                    dbId: p.id,
                    providerId: p.supplier_id,
                    providerName: p.suppliers?.name || 'Proveedor',
                    date: p.created_at?.split('T')[0],
                    total: p.total_cost,
                    status: p.status,
                    paymentStatus: p.payment_status,
                    relatedOrders: p.associated_orders ? p.associated_orders.split(', ') : [],
                    items: p.purchase_items.map(pi => ({
                        id: pi.raw_material_id,
                        name: pi.products?.name || 'Material',
                        type: pi.products?.type || 'MP',
                        toBuy: pi.quantity,
                        purchasePrice: pi.unit_cost
                    }))
                })));
            }

            // 5. Fetch Expenses
            const { data: expData, error: expError } = await supabase.from('expenses').select('*');
            if (!expError && expData?.length > 0) {
                setExpenses(expData.map(e => ({
                    id: e.id,
                    date: e.expense_date,
                    category: e.category,
                    description: e.description,
                    amount: e.amount,
                    bankId: e.bank_id
                })));
            }

            // 6. Fetch Clients
            const { data: clientData, error: clientError } = await supabase.from('clients').select('*').order('name');
            if (!clientError && clientData) {
                setClients(clientData.map(c => ({
                    id: c.id,
                    name: c.name,
                    nit: c.nit,
                    email: c.email,
                    phone: c.phone,
                    address: c.address,
                    type: c.type || 'Jurídica',
                    subType: c.type === 'Natural' ? 'B2C' : 'B2B',
                    location: c.address ? c.address.split(',').pop().trim() : 'Local',
                    status: c.status || 'Active',
                    balance: 0 // This would ideally be calculated from accounts receivable
                })));
            }

            // Update timestamp
            setLastUpdate(new Date().toLocaleString('es-CO', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: true
            }));

        } catch (err) {
            console.error("Critical error fetching from Supabase:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const addOrder = async (order) => {
        // Optimistic update
        setOrders(prev => [order, ...prev]);

        // Persist to Supabase
        try {
            // First find client ID by name if not provided
            let finalClientId = order.clientId;
            if (!finalClientId) {
                const { data: cData } = await supabase.from('clients').select('id').eq('name', order.client).single();
                if (cData) finalClientId = cData.id;
            }

            const { data: dbOrder, error: ordError } = await supabase.from('orders').insert({
                order_number: order.id,
                client_id: finalClientId,
                total_amount: order.amount,
                source: order.source,
                status: order.status || 'PENDIENTE'
            }).select().single();

            if (!ordError && dbOrder && order.items?.length > 0) {
                const itemsToInsert = order.items.map(item => ({
                    order_id: dbOrder.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity
                }));
                const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
                if (itemsError) console.error("Error inserting order items:", itemsError);
            }

            // Sync with DB to get IDs and linked data correctly
            await refreshData();
        } catch (err) {
            console.error("Error persisting order to Supabase:", err);
        }
    };

    const deleteOrders = async (ids) => {
        const idList = Array.isArray(ids) ? ids : [ids];
        const ordersToDelete = orders.filter(o => idList.includes(o.id));

        try {
            for (const order of ordersToDelete) {
                if (order.dbId) {
                    await supabase.from('order_items').delete().eq('order_id', order.dbId);
                    await supabase.from('orders').delete().eq('id', order.dbId);
                } else {
                    await supabase.from('orders').delete().eq('order_number', order.id);
                }
            }

            setOrders(prev => prev.filter(o => !idList.includes(o.id)));
            await refreshData();
            return { success: true };
        } catch (err) {
            console.error("Error deleting orders:", err);
            return { success: false, error: err.message };
        }
    };

    const updateBankBalance = async (bankId, amount, type = 'expense') => {
        try {
            // Find bank in the current state
            const bank = banks.find(b => b.id === bankId);
            if (!bank) {
                // Try finding by name (fallback for local mock data)
                const bankByName = banks.find(b => b.name === bankId);
                if (!bankByName) return;
                bankId = bankByName.id;
            }

            const currentBank = banks.find(b => b.id === bankId);
            const newBalance = type === 'income'
                ? (currentBank.balance || 0) + amount
                : (currentBank.balance || 0) - amount;

            const { error } = await supabase
                .from('banks')
                .update({ balance: newBalance })
                .eq('id', bankId);

            if (!error) {
                setBanks(prev => prev.map(b => b.id === bankId ? { ...b, balance: newBalance } : b));
            } else {
                // Local update anyway if no DB
                setBanks(prev => prev.map(b => b.id === bankId ? { ...b, balance: newBalance } : b));
            }
        } catch (err) {
            console.error("Error updating bank balance:", err);
            // Local fallback
            setBanks(prev => prev.map(b => b.id === bankId ? { ...b, balance: (b.balance || 0) + (type === 'income' ? amount : -amount) } : b));
        }
    };

    const persistPriceSync = async () => {
        console.log("Persisting price synchronization to Supabase...");
        for (const item of items) {
            if (item.type === 'product' || item.type === 'PT') {
                const { error } = await supabase
                    .from('products')
                    .update({ price: item.price })
                    .eq('id', item.id);
                if (error) console.error(`Error updating price for ${item.name}:`, error);
            }
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
            recipes, setRecipes,
            providers, setProviders,
            clients, setClients,
            addOrder,
            deleteOrders,
            updateBankBalance,
            persistPriceSync,
            refreshData,
            loading,
            lastUpdate
        }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => useContext(BusinessContext);
