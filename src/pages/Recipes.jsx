import React, { useState, useEffect } from 'react';
import { ChefHat, RefreshCw, Plus, Edit3, Trash2, X, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Recipes = () => {
    const [recipesList, setRecipesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        yield: 'Batch Producción',
        ingredients: [{ name: '', qty: '', unit: '' }]
    });

    const loadData = async () => {
        setLoading(true);
        try {
            // Get all PTs
            const { data: pts, error: ptError } = await supabase.from('products').select('*').eq('type', 'PT').order('name');
            if (ptError) throw ptError;

            // Get all Recipes mapping
            const { data: recipesMap, error: recError } = await supabase.from('recipes').select(`
                id, finished_good_id, raw_material_id, quantity_required,
                raw_material:products!recipes_raw_material_id_fkey(name, unit_measure)
            `);
            if (recError) throw recError;

            if (pts && recipesMap) {
                const list = pts.map(pt => {
                    const myIngs = recipesMap.filter(r => r.finished_good_id === pt.id);
                    const ingredients = myIngs.map(i => ({
                        id: i.id,
                        rm_id: i.raw_material_id,
                        name: i.raw_material?.name || 'Desconocido',
                        qty: i.quantity_required,
                        unit: i.raw_material?.unit_measure || 'unid'
                    }));
                    return {
                        id: pt.id,
                        name: pt.name,
                        yield: 'Batch Producción',
                        ingredients
                    };
                });
                setRecipesList(list);
            }
        } catch (error) {
            console.error("Error loading recipes from DB:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteRecipe = async (id) => {
        if (!window.confirm("¿Estás seguro que quieres eliminar esta receta?")) {
            return;
        }

        try {
            const { error } = await supabase.from('recipes').delete().eq('finished_good_id', id);
            if (!error) {
                setRecipesList(recipesList.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Error deleting recipe:", err);
        }
    };

    const handleOpenModal = (recipe = null) => {
        if (recipe) {
            setEditingRecipe(recipe);
            setFormData({ ...recipe });
        } else {
            setEditingRecipe(null);
            setFormData({
                name: '',
                yield: 'Batch Producción',
                ingredients: [{ name: '', qty: '', unit: '' }]
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecipe(null);
    };

    return (
        <div className="recipes-module">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Recetas (BOM)</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Lista de Materiales y explosión de insumos para producción Lean.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn"
                    style={{ background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Nueva Receta
                </button>
            </header>

            {loading ? (
                <p>Cargando recetas desde la base de datos...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {recipesList.map(recipe => (
                        <div key={recipe.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{recipe.name}</h3>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>Rendimiento: {recipe.yield}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleOpenModal(recipe)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
                                        title="Editar"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {recipe.ingredients.map((ing, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #eee', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#444' }}>{ing.name}</span>
                                        <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{ing.qty} {ing.unit}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleOpenModal(recipe)}
                                    style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', background: '#fff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Gestionar BOM
                                </button>
                                <button
                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                    style={{ flex: 1, padding: '0.6rem', border: '1px solid #ef4444', color: '#ef4444', background: '#fff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    title="Eliminar Receta"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Recipes;
