// Convierte "Lista de Redondos.xlsx" a data/redondos.json para el buscador del sitio.
// Uso: npm install && npm run generar-catalogo
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ORIGEN = path.join(__dirname, '..', 'Lista de Redondos.xlsx');
const DESTINO = path.join(__dirname, '..', 'data', 'redondos.json');

function clean(v) {
    if (v === undefined || v === null) return '';
    var texto = String(v).replace(/\s+/g, ' ').trim();
    // "NO LO SE" es un valor interno de carga de datos: en el sitio público se
    // prefiere mostrar un campo vacío (la tabla lo renderiza como "-").
    if (/^no lo se$/i.test(texto)) return '';
    return texto;
}

function num(v) {
    if (v === '' || v === undefined || v === null) return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
}

const wb = XLSX.readFile(ORIGEN);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
// Fila 0: encabezados agrupados. Fila 1: encabezados reales. Datos desde fila 2.
const data = rows.slice(2).filter(r => r[0] && String(r[0]).trim());

// Nota: la columna "Estado / Rotación" (política interna de ventas) se omite a propósito:
// no debe mostrarse en el buscador público.
const out = data.map(r => ({
    codigo: clean(r[0]),
    descripcion: clean(r[1]),
    tipo: clean(r[2]),
    diametroPulg: num(r[3]),
    espesor: clean(r[4]),
    concavidad: clean(r[5]),
    acorazado: clean(r[6]),
    codCentro: clean(r[7]),
    descCentro: clean(r[9]),
    formaCentral: clean(r[10]),
    medidaCentro: clean(r[11]),
    cantL1: clean(r[12]),
    formaL1: clean(r[13]),
    medidaL1: clean(r[14]),
    fresadoL1: clean(r[15]),
    diamL1: clean(r[16]),
    cantL2: clean(r[17]),
    formaL2: clean(r[18]),
    medidaL2: clean(r[19]),
    fresadoL2: clean(r[20]),
    diamL2: clean(r[21]),
    cantMuescas: clean(r[22]),
    filo: clean(r[23]),
    anchoLabor: clean(r[24]),
    planos: clean(r[25]),
    observaciones: clean(r[26]),
    maquina: clean(r[27]),
    imagen: clean(r[29]),
    imagenCentro: clean(r[30])
}));

fs.writeFileSync(DESTINO, JSON.stringify(out));
console.log('Generado data/redondos.json con', out.length, 'códigos.');
