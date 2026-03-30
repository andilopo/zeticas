const crypto = require('crypto');

const orderId = 'ZET-1774886844013';
const amount = '67000';
const currency = 'COP';
const secret = 'mUXpq7O3Y0c8-EP0VIy6kw';

const payload = `${orderId}${amount}${currency}${secret}`;
const hash = crypto.createHash('sha256').update(payload).digest('hex');

console.log("Payload:", payload);
console.log("Calculated Hash:", hash);
console.log("Hash match:", hash === "0635ef1bc1690e7deadd0769cd95e6f7a67b22179b73108d80b273fa971c37ac");
