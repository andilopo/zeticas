import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, addDoc, query, where, deleteDoc } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
  authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
  projectId: "delta-core-cloud-45ea0",
  storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
  messagingSenderId: "378250949856",
  appId: "1:378250949856:web:7a0ce44de64bc9a5becc85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const allRecipes = [
    {
      "nombre": "Mermelada Ruibarbo Fresa",
      "receta": [
        {"ingrediente": "Fresas", "cantidad": 400, "unidad": "gr"},
        {"ingrediente": "Ruibarbo", "cantidad": 600, "unidad": "gr"},
        {"ingrediente": "Azucar", "cantidad": 800, "unidad": "gr"},
        {"ingrediente": "Limon", "cantidad": 0.2, "unidad": "lb"},
        {"ingrediente": "Vainilla", "cantidad": 0.3, "unidad": "gr"}
      ]
    },
    {
      "nombre": "Dulce Silvia",
      "receta": [
        {"ingrediente": "Mora", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Guanabana", "cantidad": 1, "unidad": "kg"},
        {"ingrediente": "Azucar", "cantidad": 1000, "unidad": "gr"},
        {"ingrediente": "Lulo", "cantidad": 2, "unidad": "lb"}
      ]
    },
    {
      "nombre": "Papayuela + limonaria",
      "receta": [
        {"ingrediente": "Papayuela", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Azucar", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Limon", "cantidad": 0.2, "unidad": "lb"},
        {"ingrediente": "Limonaria", "cantidad": 50, "unidad": "gr"}
      ]
    },
    {
      "nombre": "Guava + Albahaca",
      "receta": [
        {"ingrediente": "Guayaba", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Azucar", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Limon", "cantidad": 1, "unidad": "unidad"},
        {"ingrediente": "Albahaca", "cantidad": 50, "unidad": "gr"}
      ]
    },
    {
      "nombre": "Hummus de Garbanzo",
      "receta": [
        {"ingrediente": "Garbanzo", "cantidad": 1, "unidad": "kg"},
        {"ingrediente": "Curcuma", "cantidad": 30, "unidad": "gr"},
        {"ingrediente": "Dientes de ajo", "cantidad": 0.5, "unidad": "cabeza"},
        {"ingrediente": "Limones", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Aceite vegetal", "cantidad": 500, "unidad": "ml"},
        {"ingrediente": "Sal", "cantidad": 20, "unidad": "gr"}
      ]
    },
    {
      "nombre": "Antipasto tuna",
      "receta": [
        {"ingrediente": "Pimentones", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Cebolla", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Zanahoria", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Champiñones", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Encurtidos", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Aceitunas", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Tuna", "cantidad": 900, "unidad": "gr"},
        {"ingrediente": "Salsa de Tomate", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Sal", "cantidad": 30, "unidad": "gr"},
        {"ingrediente": "Pimienta", "cantidad": 15, "unidad": "gr"},
        {"ingrediente": "Aceite de Oliva", "cantidad": 500, "unidad": "ml"}
      ]
    },
    {
      "nombre": "Vinagreta",
      "receta": [
        {"ingrediente": "Vinagre de frutas", "cantidad": 250, "unidad": "ml"},
        {"ingrediente": "Laureles", "cantidad": 0.3, "unidad": "atado"},
        {"ingrediente": "Sal", "cantidad": 30, "unidad": "gr"},
        {"ingrediente": "Pimenton", "cantidad": 0.5, "unidad": "lb"},
        {"ingrediente": "Cebolla", "cantidad": 0.5, "unidad": "lb"},
        {"ingrediente": "Perejil", "cantidad": 100, "unidad": "gr"},
        {"ingrediente": "Aceite oliva", "cantidad": 250, "unidad": "ml"},
        {"ingrediente": "Pimienta", "cantidad": 5, "unidad": "gr"},
        {"ingrediente": "Ajo", "cantidad": 0.25, "unidad": "cabeza"}
      ]
    }
];

async function restore() {
    console.log("🛠️ Restaurando todas las recetas en Firestore...");

    // 1. Obtener productos para mapeo por nombre
    const prodSnap = await getDocs(collection(db, 'products'));
    const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const item of allRecipes) {
        console.log(`\n📦 Producto: ${item.nombre}`);
        
        // Buscar PT (Producto Terminado)
        let pt = products.find(p => (p.name || '').toLowerCase() === item.nombre.toLowerCase());
        
        if (!pt) {
            console.log(`  - Creando PT: ${item.nombre}`);
            const ptRef = await addDoc(collection(db, 'products'), {
                name: item.nombre,
                type: 'PT',
                category: 'General',
                unit_measure: 'unidad',
                created_at: new Date().toISOString()
            });
            pt = { id: ptRef.id, name: item.nombre };
        }

        // Limpiar recetas viejas de este producto
        const qOld = query(collection(db, 'recipes'), where('finished_good_id', '==', pt.id));
        const oldSnap = await getDocs(qOld);
        for (const docOld of oldSnap.docs) {
            await deleteDoc(doc(db, 'recipes', docOld.id));
        }

        // Insertar ingredientes
        for (const ing of item.receta) {
            let mat = products.find(p => (p.name || '').toLowerCase() === ing.ingrediente.toLowerCase());
            
            if (!mat) {
                console.log(`    - Creando MP: ${ing.ingrediente}`);
                const matRef = await addDoc(collection(db, 'products'), {
                    name: ing.ingrediente,
                    type: 'MP',
                    category: 'Materia Prima',
                    unit_measure: ing.unidad || 'gr',
                    created_at: new Date().toISOString()
                });
                mat = { id: matRef.id, name: ing.ingrediente, sku: ing.ingrediente };
            }

            await addDoc(collection(db, 'recipes'), {
                finished_good_id: pt.id,
                finished_good_name: pt.name,
                raw_material_id: mat.id,
                raw_material_name: mat.name,
                raw_material_sku: mat.sku || mat.name,
                quantity_required: Number(ing.cantidad),
                unit: ing.unidad,
                yield_quantity: 1, // Default
                created_at: new Date().toISOString()
            });
            console.log(`    + Insumo: ${ing.cantidad} ${ing.unidad} de ${ing.ingrediente}`);
        }
    }

    console.log("\n✨ Restauración de recetas completada correctamente.");
    process.exit(0);
}

restore().catch(console.error);
