import xlsx from 'xlsx';

// Function to normalize string
const norm = (str) => typeof str === 'string' ? str.trim().toLowerCase() : str;
const titleCase = (str) => typeof str === 'string' ? str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : str;

const workbook = xlsx.readFile('Sku_materias_primas_recetas_zeticas 2026.xlsx');

const rawMaterials = new Map(); // name -> { name, unit, costPerUnit }
const recipes = []; // { name, category, materials: [{ name, qty, unit, cost }], totalCost }

for (const sheetName of workbook.SheetNames) {
    const isSalt = sheetName.toLowerCase().includes('sal');
    const category = isSalt ? 'Sal' : 'Dulce';
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find where Costo or Lista starts
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

        // 1. Extract BOM materials (rows 2 to costRowIdx - 1)
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

        // 2. Extract Purchase Costs (rows costRowIdx+1 onwards)
        // The format at costRowIdx+1 is:
        // col: name, col+1: price, col+2: qty, col+3: unit
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
                        rawMaterials.set(norm(nameTitle), { name: nameTitle, unit: u, costPerUnit, purchasePrice: p, purchaseQty: q });
                    }
                }
            }
        }

        recipes.push({ name: recipeName, category, materials });
    }
}

// Ensure all BOM materials exist in rawMaterials
for (const recipe of recipes) {
    for (const mat of recipe.materials) {
        const key = norm(mat.name);
        if (!rawMaterials.has(key)) {
            rawMaterials.set(key, { name: mat.name, unit: mat.unit, costPerUnit: 0, purchasePrice: 0, purchaseQty: 0 });
        }
    }
}

// Calculate Recipe Cost
for (const recipe of recipes) {
    let totalCost = 0;
    for (const mat of recipe.materials) {
        const rm = rawMaterials.get(norm(mat.name));
        // Check unit conversions if necessary, but assume normalized or same roughly
        const cost = rm ? rm.costPerUnit * mat.qty : 0;
        mat.cost = cost;
        totalCost += cost;
    }
    recipe.totalCost = totalCost;
}

console.log("Recipes extracted:", recipes.length);
console.log("Raw materials extracted:", rawMaterials.size);
console.log("\nSample Recipe:", JSON.stringify(recipes[0], null, 2));
console.log("\nSample Material:", Array.from(rawMaterials.values())[0]);
