const xlsx = require('xlsx');

const workbook = xlsx.readFile('Sku_materias_primas_recetas_zeticas 2026.xlsx');
console.log("Sheet names:");
console.log(workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
    console.log(`\n\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 20 rows to understand structure
    console.log(jsonData.slice(0, 20));
}
