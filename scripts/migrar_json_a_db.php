<?php
// Migra data/redondos.json (generado desde el Excel) a la base de datos.
// Se puede correr varias veces: actualiza por código (INSERT ... ON DUPLICATE KEY UPDATE).
// Uso: php scripts/migrar_json_a_db.php

require_once __DIR__ . '/../admin/db.php';

$rutaJson = __DIR__ . '/../data/redondos.json';
if (!is_file($rutaJson)) {
    die("No se encontró $rutaJson. Corré primero: npm run generar-catalogo\n");
}

$datos = json_decode(file_get_contents($rutaJson), true);
if (!is_array($datos)) {
    die("El JSON no se pudo leer correctamente.\n");
}

$pdo = obtenerConexion();

$mapaColumnas = [
    'codigo' => 'codigo',
    'descripcion' => 'descripcion',
    'tipo' => 'tipo',
    'diametroPulg' => 'diametro_pulg',
    'espesor' => 'espesor',
    'concavidad' => 'concavidad',
    'acorazado' => 'acorazado',
    'codCentro' => 'cod_centro',
    'descCentro' => 'desc_centro',
    'formaCentral' => 'forma_central',
    'medidaCentro' => 'medida_centro',
    'cantL1' => 'cant_l1',
    'formaL1' => 'forma_l1',
    'medidaL1' => 'medida_l1',
    'fresadoL1' => 'fresado_l1',
    'diamL1' => 'diam_l1',
    'cantL2' => 'cant_l2',
    'formaL2' => 'forma_l2',
    'medidaL2' => 'medida_l2',
    'fresadoL2' => 'fresado_l2',
    'diamL2' => 'diam_l2',
    'cantMuescas' => 'cant_muescas',
    'filo' => 'filo',
    'anchoLabor' => 'ancho_labor',
    'planos' => 'planos',
    'observaciones' => 'observaciones',
    'maquina' => 'maquina',
    'imagen' => 'imagen',
    'imagenCentro' => 'imagen_centro',
];

$columnasDb = array_values($mapaColumnas);
$placeholders = array_map(function ($c) { return ":$c"; }, $columnasDb);
$actualizaciones = array_map(function ($c) { return "$c = VALUES($c)"; }, array_diff($columnasDb, ['codigo']));

$sql = 'INSERT INTO redondos (' . implode(', ', $columnasDb) . ') VALUES (' . implode(', ', $placeholders) . ')
        ON DUPLICATE KEY UPDATE ' . implode(', ', $actualizaciones);
$stmt = $pdo->prepare($sql);

$insertados = 0;
$errores = 0;

$pdo->beginTransaction();
foreach ($datos as $item) {
    $valores = [];
    foreach ($mapaColumnas as $claveJson => $columnaDb) {
        $v = $item[$claveJson] ?? null;
        if ($columnaDb === 'diametro_pulg') {
            $valores[$columnaDb] = ($v === null || $v === '') ? null : (float) $v;
        } else {
            $valores[$columnaDb] = ($v === null) ? '' : $v;
        }
    }
    try {
        $stmt->execute($valores);
        $insertados++;
    } catch (Throwable $e) {
        $errores++;
        fwrite(STDERR, 'Error con código ' . ($item['codigo'] ?? '?') . ': ' . $e->getMessage() . "\n");
    }
}
$pdo->commit();

echo "Migración terminada. Procesados: $insertados. Errores: $errores.\n";
