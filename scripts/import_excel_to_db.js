import fs from 'fs';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Manually parse .env
try {
    const env = fs.readFileSync('.env', 'utf8').split('\n');
    env.forEach(row => {
        const parts = row.split('=');
        if (parts.length >= 2) {
            const k = parts[0].trim();
            const v = parts.slice(1).join('=').trim();
            if (k && v) process.env[k] = v;
        }
    });
} catch (e) { }

// Initialize Supabase Client

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers
const norm = (str) => typeof str === 'string' ? str.trim().toLowerCase() : str;
const titleCase = (str) => typeof str === 'string' ? str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : str;

const run = async () => {
    console.log('Starting Excel Import...');
    const workbook = xlsx.readFile('Sku_materias_primas_recetas_zeticas 2026.xlsx');

    const rawMaterials = new Map();
    const recipesData = [];

    // PARSE EXCEL
    for (const sheetName of workbook.SheetNames) {
        const isSalt = sheetName.toLowerCase().includes('sal');
        const category = isSalt ? 'Sal' : 'Dulce';
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        let costRowIdx = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] && rows[i][0] && typeof rows[i][0] === 'string' && (rows[i][0].includes('Costo') || rows[i][0].includes('Lista'))) {
                costRowIdx = i;
                break;
            }
        }

        const recipeNamesRow = rows[0];
        const numCols = recipeNamesRow.length;

        for (let col = 0; col < numCols; col++) {
            const rawRecipeName = recipeNamesRow[col];
            if (!rawRecipeName || typeof rawRecipeName !== 'string' || rawRecipeName.trim() === '') continue;

            const recipeName = titleCase(rawRecipeName);
            const materials = [];

            // Extract BOM materials
            for (let r = 2; r < (costRowIdx > 0 ? costRowIdx : rows.length); r++) {
                if (!rows[r]) continue;
                const matName = rows[r][col];
                const qty = rows[r][col + 2];
                const unit = rows[r][col + 3];

                if (matName && typeof matName === 'string' && matName.trim() !== '') {
                    materials.push({
                        name: titleCase(matName),
                        qty: parseFloat(qty) || 0,
                        unit: typeof unit === 'string' ? unit.trim().toLowerCase() : unit
                    });
                }
            }

            // Extract Purchase Costs
            if (costRowIdx > 0) {
                for (let r = costRowIdx + 1; r < rows.length; r++) {
                    if (!rows[r]) continue;
                    const matName = rows[r][col];
                    const price = rows[r][col + 1];
                    const qty = rows[r][col + 2];
                    const unit = rows[r][col + 3];

                    if (matName && typeof matName === 'string' && matName.trim() !== '') {
                        const nameTitle = titleCase(matName);
                        const p = parseFloat(price) || 0;
                        const q = parseFloat(qty) || 1;
                        const u = typeof unit === 'string' ? unit.trim().toLowerCase() : unit;
                        const costPerUnit = q > 0 ? p / q : 0;

                        if (!rawMaterials.has(norm(nameTitle)) || rawMaterials.get(norm(nameTitle)).costPerUnit === 0) {
                            rawMaterials.set(norm(nameTitle), { name: nameTitle, unit: u, costPerUnit });
                        }
                    }
                }
            }

            recipesData.push({ name: recipeName, category, materials });
        }
    }

    // Ensure all BOM materials exist in rawMaterials
    for (const recipe of recipesData) {
        for (const mat of recipe.materials) {
            const key = norm(mat.name);
            if (!rawMaterials.has(key)) {
                rawMaterials.set(key, { name: mat.name, unit: mat.unit, costPerUnit: 0 });
            }
        }
    }

    // Calculate Recipe Cost
    for (const recipe of recipesData) {
        let totalCost = 0;
        for (const mat of recipe.materials) {
            const rm = rawMaterials.get(norm(mat.name));
            const cost = rm ? rm.costPerUnit * mat.qty : 0;
            mat.cost = cost;
            totalCost += cost;
        }
        recipe.totalCost = totalCost;
    }

    console.log(`Parsed ${recipesData.length} recipes and ${rawMaterials.size} raw materials.`);

    // START DB SYNC
    const { data: existingProducts, error: fetchError } = await supabase.from('products').select('*');
    if (fetchError) throw fetchError;
    const productsByName = new Map(existingProducts.map(p => [norm(p.name), p]));

    // 1. Upsert Raw Materials (MP)
    const mpIdMap = new Map(); // norm(name) -> id
    console.log('Upserting Raw Materials (MP)...');
    for (const mp of rawMaterials.values()) {
        const key = norm(mp.name);
        let existing = productsByName.get(key);
        let sku = existing?.sku || `MP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const mpRow = {
            name: mp.name,
            sku,
            type: 'MP',
            category: 'Insumo',
            unit_measure: mp.unit || 'und',
            cost: mp.costPerUnit,
            stock: 50, // User requested 50 initial
            min_stock_level: 10 // User requested 10 safety stock
        };

        if (existing) {
            mpRow.id = existing.id;
            const { data, error } = await supabase.from('products').update(mpRow).eq('id', existing.id).select();
            if (error) console.error("Error updating MP:", mp.name, error.message);
            else mpIdMap.set(key, data[0].id);
        } else {
            const { data, error } = await supabase.from('products').insert([mpRow]).select();
            if (error) console.error("Error inserting MP:", mp.name, error.message);
            else mpIdMap.set(key, data[0].id);
        }
    }

    // 1.5 Insert Inventory Movements for Initial Load
    console.log('Inserting Initial Inventory Movements (50 for all)...');
    const movementsToInsert = [];
    for (const [key, id] of mpIdMap.entries()) {
        movementsToInsert.push({
            product_id: id,
            movement_type: 'CARGUE_INICIAL',
            quantity: 50,
            notes: 'Cargue de Inventario Inicial por script desde Excel'
        });
    }
    if (movementsToInsert.length > 0) {
        // Avoid inserting 1000s, batch them if large, but 60 is fine
        const { error: movError } = await supabase.from('inventory_movements').insert(movementsToInsert);
        if (movError) {
            console.error("Warning: inventory_movements error:", movError.message);
        }
    }


    // 2. Upsert Finished Products (PT)
    const ptIdMap = new Map();
    console.log('Upserting Finished Products (PT)...');
    for (const recipe of recipesData) {
        const key = norm(recipe.name);
        let existing = productsByName.get(key);
        let sku = existing?.sku || `PT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const ptRow = {
            name: recipe.name,
            sku,
            type: 'PT',
            category: recipe.category,
            unit_measure: 'unidad',
            cost: recipe.totalCost
        };

        if (existing) {
            ptRow.id = existing.id;
            // Keep price as is
            const { data, error } = await supabase.from('products').update(ptRow).eq('id', existing.id).select();
            if (error) console.error("Error updating PT:", recipe.name, error);
            else ptIdMap.set(key, data[0].id);
        } else {
            const { data, error } = await supabase.from('products').insert([ptRow]).select();
            if (error) console.error("Error inserting PT:", recipe.name, error);
            else ptIdMap.set(key, data[0].id);
        }
    }

    // 3. Clear and Insert BOM (Recipes)
    console.log('Building BOM / Recipes...');
    for (const recipe of recipesData) {
        const ptId = ptIdMap.get(norm(recipe.name));
        if (!ptId) continue;

        // Delete existing links
        await supabase.from('recipes').delete().eq('finished_good_id', ptId);

        // Insert new ones
        const links = [];
        for (const mat of recipe.materials) {
            const mpId = mpIdMap.get(norm(mat.name));
            if (mpId) {
                links.push({
                    finished_good_id: ptId,
                    raw_material_id: mpId,
                    quantity_required: mat.qty
                });
            }
        }

        if (links.length > 0) {
            const { error } = await supabase.from('recipes').insert(links);
            if (error) console.error("Error linking recipe:", recipe.name, error.message);
        }
    }

    console.log('Excel Import Completed successfully!');
};

run().catch(console.error);
