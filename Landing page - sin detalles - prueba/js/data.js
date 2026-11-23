/* ============================================================
   data.js — Datos del prototipo Munay
   ============================================================ */
window.Munay = window.Munay || {};

Munay.data = {
  coverage: [
    'Miraflores', 'Surquillo', 'San Isidro', 'San Miguel', 'Magdalena del Mar',
    'Jesús María', 'Lince', 'Cercado de Lima', 'Santiago de Surco', 'La Molina',
    'Pueblo Libre', 'Santa Anita'
  ],

  typeLabels: {
    mercado: 'Mercado',
    parque: 'Parque',
    universidad: 'Universidad'
  },

  typeIcons: {
    mercado: 'store',
    parque: 'leaf',
    universidad: 'book'
  },

  points: [
    { id: 'p1', name: 'Mercado de Surquillo', type: 'mercado', district: 'Surquillo', address: 'Av. Paseo de la República 455', hours: 'Lun a sáb · 7:00 a 17:00 h', materials: ['PET', 'HDPE', 'Bolsas'], lat: -12.1135, lng: -77.0205, x: 40, y: 58 },
    { id: 'p2', name: 'Mercado Magdalena', type: 'mercado', district: 'Magdalena del Mar', address: 'Av. Sucre 1250', hours: 'Lun a dom · 6:00 a 16:00 h', materials: ['PET', 'HDPE'], lat: -12.0930, lng: -77.0730, x: 24, y: 40 },
    { id: 'p3', name: 'Mercado San Miguel', type: 'mercado', district: 'San Miguel', address: 'Av. La Mar 1450', hours: 'Lun a sáb · 6:00 a 18:00 h', materials: ['PET', 'HDPE', 'PP'], lat: -12.0770, lng: -77.0830, x: 23, y: 30 },
    { id: 'p4', name: 'Mercado Mayorista Santa Anita', type: 'mercado', district: 'Santa Anita', address: 'Av. Los Ángeles s/n', hours: 'Lun a dom · 4:00 a 18:00 h', materials: ['PET', 'HDPE', 'Bolsas'], lat: -12.0440, lng: -76.9720, x: 77, y: 52 },
    { id: 'p5', name: 'Mercado de Jesús María', type: 'mercado', district: 'Jesús María', address: 'Av. San Felipe 500', hours: 'Lun a sáb · 7:00 a 16:00 h', materials: ['PET', 'PP'], lat: -12.0740, lng: -77.0480, x: 40, y: 34 },

    { id: 'p6', name: 'Parque Kennedy', type: 'parque', district: 'Miraflores', address: 'Av. Larco 800', hours: 'Lun a dom · 6:00 a 22:00 h', materials: ['PET', 'HDPE'], lat: -12.1220, lng: -77.0300, x: 38, y: 72 },
    { id: 'p7', name: 'Parque El Olivar', type: 'parque', district: 'San Isidro', address: 'Av. Los Nogales 250', hours: 'Lun a dom · 7:00 a 20:00 h', materials: ['PET', 'PP'], lat: -12.0990, lng: -77.0360, x: 42, y: 48 },
    { id: 'p8', name: 'Parque Reducto', type: 'parque', district: 'Miraflores', address: 'Av. Benavides 5440', hours: 'Lun a dom · 7:00 a 21:00 h', materials: ['PET', 'Bolsas'], lat: -12.1170, lng: -77.0390, x: 35, y: 64 },
    { id: 'p9', name: 'Parque de la Exposición', type: 'parque', district: 'Cercado de Lima', address: 'Av. 28 de Julio s/n', hours: 'Mar a dom · 8:00 a 20:00 h', materials: ['PET', 'HDPE', 'PP'], lat: -12.0620, lng: -77.0370, x: 47, y: 40 },
    { id: 'p10', name: 'Parque Campo de Marte', type: 'parque', district: 'Jesús María', address: 'Av. de la Peruanidad s/n', hours: 'Lun a dom · 6:00 a 21:00 h', materials: ['PET', 'HDPE'], lat: -12.0680, lng: -77.0430, x: 40, y: 27 },

    { id: 'p11', name: 'Universidad Nacional de Ingeniería', type: 'universidad', district: 'Rímac', address: 'Av. Túpac Amaru 210', hours: 'Lun a vie · 8:00 a 18:00 h', materials: ['PET', 'HDPE', 'PP'], lat: -12.0240, lng: -77.0480, x: 52, y: 20 },
    { id: 'p12', name: 'PUCP', type: 'universidad', district: 'San Miguel', address: 'Av. Universitaria 1801', hours: 'Lun a sáb · 8:00 a 17:00 h', materials: ['PET', 'HDPE', 'Bolsas'], lat: -12.0690, lng: -77.0790, x: 36, y: 24 },
    { id: 'p13', name: 'Universidad de Lima', type: 'universidad', district: 'Santiago de Surco', address: 'Av. Javier Prado Este 4600', hours: 'Lun a vie · 7:00 a 19:00 h', materials: ['PET', 'PP'], lat: -12.0840, lng: -76.9700, x: 58, y: 62 },
    { id: 'p14', name: 'UPC Monterrico', type: 'universidad', district: 'Santiago de Surco', address: 'Av. Primavera 2390', hours: 'Lun a sáb · 8:00 a 18:00 h', materials: ['PET', 'HDPE', 'Bolsas'], lat: -12.1040, lng: -76.9630, x: 66, y: 68 },
    { id: 'p15', name: 'Universidad Nacional Mayor de San Marcos', type: 'universidad', district: 'Cercado de Lima', address: 'Ciudad Universitaria, Av. Venezuela', hours: 'Lun a vie · 7:00 a 17:00 h', materials: ['PET', 'HDPE', 'PP'], lat: -12.0560, lng: -77.0840, x: 44, y: 22 }
  ],

  markets: [
    { id: 'm1', name: 'Mercado de Surquillo', district: 'Surquillo', address: 'Av. Paseo de la República 455', schedule: 'Lun a sáb · 7:00 a 17:00 h', acopio: true, bolsa: true, reward: '10% de descuento al mostrar tu bolsa Munay en compras mayores a S/ 30.', materials: ['PET', 'HDPE', 'Bolsas'] },
    { id: 'm2', name: 'Mercado Magdalena', district: 'Magdalena del Mar', address: 'Av. Sucre 1250', schedule: 'Lun a dom · 6:00 a 16:00 h', acopio: true, bolsa: true, reward: 'Sorteo mensual de una canasta agroecológica entre clientes con bolsa de tela.', materials: ['PET', 'HDPE'] },
    { id: 'm3', name: 'Mercado San Miguel', district: 'San Miguel', address: 'Av. La Mar 1450', schedule: 'Lun a sáb · 6:00 a 18:00 h', acopio: true, bolsa: true, reward: '+50 puntos Munay por compra con bolsa reutilizable en 8 puestos aliados.', materials: ['PET', 'HDPE', 'PP'] },
    { id: 'm4', name: 'Mercado de Jesús María', district: 'Jesús María', address: 'Av. San Felipe 500', schedule: 'Lun a sáb · 7:00 a 16:00 h', acopio: true, bolsa: true, reward: 'Descuento de S/ 2 en tu compra al reutilizar bolsa de tela.', materials: ['PET', 'PP'] },
    { id: 'm5', name: 'Mercado Mayorista Santa Anita', district: 'Santa Anita', address: 'Av. Los Ángeles s/n', schedule: 'Lun a dom · 4:00 a 18:00 h', acopio: true, bolsa: false, reward: '', materials: ['PET', 'HDPE', 'Bolsas'] },
    { id: 'm6', name: 'Mercado de Surco', district: 'Santiago de Surco', address: 'Av. Ayacucho 500', schedule: 'Lun a sáb · 7:00 a 17:00 h', acopio: false, bolsa: true, reward: 'Comercios aliados premian la bolsa de tela con +30 puntos por compra.', materials: ['PET', 'Bolsas'] }
  ],

  rewards: [
    { id: 'r1', name: 'Bolsa de tela Munay', desc: 'Bolsa de algodón orgánico para tus compras de mercado.', points: 400, category: 'Accesorio', icon: 'bag', art: 'green', stock: 'Stock disponible' },
    { id: 'r2', name: 'Cupón 10% en mercado aliado', desc: 'Descuento en una compra mayor a S/ 30 en mercados participantes.', points: 600, category: 'Descuento', icon: 'tag', art: 'amber', stock: 'Válido por 30 días' },
    { id: 'r3', name: 'Kit de reciclaje para casa', desc: 'Dos bolsas de tela y una guía impresa para separar en casa.', points: 900, category: 'Hogar', icon: 'package', art: 'teal', stock: 'Incluye 3 piezas' },
    { id: 'r4', name: 'Termo de acero Munay', desc: 'Termo de acero inoxidable de 600 ml, libre de plástico.', points: 1500, category: 'Hogar', icon: 'bottle', art: 'blue', stock: 'Stock limitado' },
    { id: 'r5', name: 'Donación a limpieza de playas', desc: 'Financias la recuperación de 5 kg de residuos en la Costa Verde.', points: 500, category: 'Impacto', icon: 'leaf', art: 'rose', stock: 'Donación directa' },
    { id: 'r6', name: 'Pack de bolsas reutilizables', desc: 'Cuatro bolsas de malla para frutas y verduras a granel.', points: 800, category: 'Accesorio', icon: 'bag', art: 'sand', stock: 'Incluye 4 bolsas' }
  ],

  movements: [
    { icon: 'recycle', title: 'Recojo MUN-00119 · PET', date: '12 oct 2026', amount: 120 },
    { icon: 'recycle', title: 'Recojo MUN-00114 · Envases rígidos', date: '05 oct 2026', amount: 80 },
    { icon: 'gift', title: 'Canje · Cupón de mercado', date: '28 sep 2026', amount: -300 },
    { icon: 'store', title: 'Bono · Compra con bolsa de tela', date: '24 sep 2026', amount: 60 },
    { icon: 'recycle', title: 'Recojo MUN-00108 · PET', date: '18 sep 2026', amount: 150 }
  ],

  prices: [
    { key: 'pet', material: 'Botellas PET', code: '01', price: 1.80, points: 60 },
    { key: 'hdpe', material: 'Envases rígidos HDPE', code: '02', price: 1.20, points: 45 },
    { key: 'pp', material: 'Tapas y polipropileno', code: '05', price: 0.90, points: 35 },
    { key: 'bolsas', material: 'Bolsas y film', code: '04', price: 0.40, points: 25 },
    { key: 'mixto', material: 'Plástico mixto', code: '07', price: 0.30, points: 20 }
  ],

  plasticCodes: [
    { code: 1, short: 'PET', name: 'PET / PETE', alias: 'Tereftalato de polietileno', status: 'ok', statusLabel: 'Aceptado', uses: 'Botellas de agua, gaseosas, aceite y envases de limpieza.', tip: 'Enjuaga, retira la tapa y aplasta la botella antes de entregarla.' },
    { code: 2, short: 'HDPE', name: 'HDPE / PEAD', alias: 'Polietileno de alta densidad', status: 'ok', statusLabel: 'Aceptado', uses: 'Envases de shampoo, detergente, leche y potes de yogurt.', tip: 'Retira etiquetas y enjuaga para evitar olores. Puedes entregar la tapa aparte.' },
    { code: 3, short: 'PVC', name: 'PVC', alias: 'Policloruro de vinilo', status: 'no', statusLabel: 'No aceptado', uses: 'Tuberías, marcos de ventanas, blísteres y algunos juguetes.', tip: 'No lo incluyas en tu bolsa Munay. Llévalo a un punto autorizado de residuos especiales.' },
    { code: 4, short: 'LDPE', name: 'LDPE / PEBD', alias: 'Polietileno de baja densidad', status: 'partial', statusLabel: 'Condicional', uses: 'Bolsas de mercado, film transparente y empaques flexibles.', tip: 'Solo se aceptan bolsas limpias y secas. Junta varias dentro de una y anúdala.' },
    { code: 5, short: 'PP', name: 'PP', alias: 'Polipropileno', status: 'ok', statusLabel: 'Aceptado', uses: 'Tapas de botella, tapers, baldes y envases de alimentos.', tip: 'Separa las tapas del cuerpo del envase si son de distinto material.' },
    { code: 6, short: 'PS', name: 'PS', alias: 'Poliestireno', status: 'no', statusLabel: 'No aceptado', uses: 'Vasos descartables, cubiertos, bandejas y tecnopor.', tip: 'Se fragmenta con facilidad y no tiene mercado local. Evita comprarlo.' },
    { code: 7, short: 'OTROS', name: 'Otros', alias: 'PC, ABS, PLA y mezclas', status: 'no', statusLabel: 'No aceptado', uses: 'Botellas de agua reutilizables, piezas de electrodomésticos y envases compostables.', tip: 'No lo mezcles con PET u HDPE: contamina el lote completo. Consulta antes de entregarlo.' }
  ]
};
