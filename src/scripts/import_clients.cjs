const xlsx = require('xlsx');
const path = require('path');

const filePath = "/Users/andreslopez/Desktop/XL Ideas/IIRS SAS/1. Zeticas/1. Control de facturación Z.xlsm";

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'DB';
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        console.error(`Sheet ${sheetName} not found`);
        process.exit(1);
    }

    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Columns G and H are index 6 and 7
    const clients = data.slice(1).map(row => ({
        name: row[6],
        type: row[7]
    })).filter(c => c.name);

    // Filter duplicates
    const uniqueClients = [];
    const names = new Set();
    clients.forEach(c => {
        if (!names.has(c.name)) {
            names.add(c.name);
            uniqueClients.push(c);
        }
    });

    console.log(JSON.stringify(uniqueClients, null, 2));
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
