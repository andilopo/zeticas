const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/plantilla_cargue_masivo_clientes_zeticas.xlsx');

// Read the workbook
const wb = XLSX.readFile(filePath);
const wsname = wb.SheetNames[0];
const ws = wb.Sheets[wsname];

// Convert to json
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

if (data.length > 0) {
    // Find index of 'Cargo Contacto'
    const headerRow = data[0];
    const cargoIndex = headerRow.findIndex(cell => typeof cell === 'string' && cell.trim() === 'Cargo Contacto');

    if (cargoIndex !== -1) {
        // Remove column from each row
        const newData = data.map(row => {
            if (row.length > cargoIndex) {
                row.splice(cargoIndex, 1);
            }
            return row;
        });

        // Convert back to sheet
        const newWs = XLSX.utils.aoa_to_sheet(newData);
        wb.Sheets[wsname] = newWs;

        // Write to file
        XLSX.writeFile(wb, filePath);
        console.log('Successfully removed "Cargo Contacto" column from template.');
    } else {
        console.log('"Cargo Contacto" column not found in template headers: ', headerRow);
    }
} else {
    console.log('No data found in template.');
}
