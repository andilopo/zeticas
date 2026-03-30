import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeHMdtEt04RtYarEx_h19gcCUzsIUUpSc",
  authDomain: "delta-core-cloud-45ea0.firebaseapp.com",
  projectId: "delta-core-cloud-45ea0",
  storageBucket: "delta-core-cloud-45ea0.firebasestorage.app",
  messagingSenderId: "378250949856",
  appId: "1:378250949856:web:7a0ce44de64bc9a5becc85",
  measurementId: "G-Q1BXE4WVZP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jsonData = {
  "productos": [
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
        {"ingrediente": "Guayaba", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Pera", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Papayuela", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Ruibarbo", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Azucar", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Limon", "cantidad": 0.2, "unidad": "lb"},
        {"ingrediente": "Limonaria", "cantidad": 50, "unidad": "gr"},
        {"ingrediente": "Albahaca", "cantidad": 0, "unidad": "gr"},
        {"ingrediente": "Gengibre", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Naranja", "cantidad": 0, "unidad": "lb"}
      ]
    },
    {
      "nombre": "Guava + Albahaca",
      "receta": [
        {"ingrediente": "Guayaba", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Pera", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Papayuela", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Ruibarbo", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Azucar", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Limon", "cantidad": 1, "unidad": "unidad"},
        {"ingrediente": "Menta", "cantidad": 0, "unidad": "gr"},
        {"ingrediente": "Albahaca", "cantidad": 50, "unidad": "gr"},
        {"ingrediente": "Gengibre", "cantidad": 0, "unidad": "lb"},
        {"ingrediente": "Naranja", "cantidad": 0, "unidad": "lb"}
      ]
    },
    {
      "nombre": "Mermelada Agraz Flor Jamaica Canela",
      "receta": [
        {"ingrediente": "Agraz", "cantidad": 1000, "unidad": "gr"},
        {"ingrediente": "Flor de Jamaica", "cantidad": 0, "unidad": "gr"},
        {"ingrediente": "Azucar", "cantidad": 300, "unidad": "gr"},
        {"ingrediente": "Naranja", "cantidad": 0.4, "unidad": "lb"},
        {"ingrediente": "Canela", "cantidad": 1, "unidad": "gr"}
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
    },
    {
      "nombre": "Antipasto Veggie",
      "receta": [
        {"ingrediente": "Pimentones", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Cebolla", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Zanahoria", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Champiñones", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Encurtidos", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Aceitunas", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Salsa de Tomate", "cantidad": 250, "unidad": "gr"},
        {"ingrediente": "Sal", "cantidad": 10, "unidad": "gr"},
        {"ingrediente": "Pimienta", "cantidad": 15, "unidad": "gr"},
        {"ingrediente": "Aceite de Oliva", "cantidad": 500, "unidad": "ml"}
      ]
    },
    {
      "nombre": "Berenjena Toscana",
      "receta": [
        {"ingrediente": "Berenjena", "cantidad": 5, "unidad": "lb"},
        {"ingrediente": "Pimenton", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Cebolla", "cantidad": 2, "unidad": "lb"},
        {"ingrediente": "Zanahoria", "cantidad": 1, "unidad": "lb"},
        {"ingrediente": "Aceite oliva", "cantidad": 450, "unidad": "ml"},
        {"ingrediente": "Sal", "cantidad": 30, "unidad": "gr"},
        {"ingrediente": "Pimienta", "cantidad": 10, "unidad": "gr"},
        {"ingrediente": "Paprika", "cantidad": 10, "unidad": "gr"}
      ]
    }
  ]
};

async function findProductByName(name) {
  const q = query(collection(db, "products"), where("name", "==", name));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  return null;
}

async function createMissingProduct(name, type) {
  const docRef = await addDoc(collection(db, "products"), {
    name,
    type,
    category: type === 'PT' ? 'Producto Terminado' : 'Materia Prima',
    unit: 'gr', 
    price: 0,
    created_at: new Date().toISOString()
  });
  return { id: docRef.id, name, type };
}

async function execute() {
  console.log("🚀 Iniciando carga de recetas via Web SDK...");

  for (const product of jsonData.productos) {
    console.log(`\n📦 Procesando: ${product.nombre}`);
    
    let pt = await findProductByName(product.nombre);
    if (!pt) {
      console.log(`  - Producto PT no encontrado, creando: ${product.nombre}`);
      pt = await createMissingProduct(product.nombre, 'PT');
    }

    // Borrar recetas previas
    const qRec = query(collection(db, "recipes"), where("finished_good_id", "==", pt.id));
    const recSnap = await getDocs(qRec);
    for (const d of recSnap.docs) {
      await deleteDoc(doc(db, "recipes", d.id));
    }
    console.log(`  - Receta previa limpiada.`);

    for (const item of product.receta) {
      const qty = Number(item.cantidad) || 0;
      // Saltamos items vacíos si no tienen cantidad
      if (qty === 0 && !item.unidad) continue;

      let mat = await findProductByName(item.ingrediente);
      if (!mat) {
        console.log(`    - Ingrediente no encontrado, creando: ${item.ingrediente}`);
        mat = await createMissingProduct(item.ingrediente, 'material');
      }

      await addDoc(collection(db, "recipes"), {
        finished_good_id: pt.id,
        finished_good_name: pt.name,
        raw_material_id: mat.id,
        raw_material_name: mat.name,
        raw_material_sku: mat.sku || mat.name,
        quantity_required: qty,
        unit: item.unidad || mat.unit || 'gr',
        created_at: new Date().toISOString()
      });
      console.log(`    + Añadido: ${qty} ${item.unidad || 'gr'} de ${item.ingrediente}`);
    }
  }

  console.log("\n🏁 Carga de recetas finalizada correctamente.");
  process.exit(0);
}

execute();
