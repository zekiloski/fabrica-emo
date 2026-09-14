<?php
require_once __DIR__ . '/auth.php';
requerirLogin();
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}
verificarCsrf();

$campos = require __DIR__ . '/campos.php';
$pdo = obtenerConexion();

$id = (int) ($_POST['id'] ?? 0);
$codigo = trim($_POST['codigo'] ?? '');

if ($codigo === '') {
    die('El código de artículo es obligatorio. <a href="javascript:history.back()">Volver</a>');
}

// --- Validar que el codigo no este repetido en otro producto ---
$stmt = $pdo->prepare('SELECT id FROM redondos WHERE codigo = ? AND id <> ? LIMIT 1');
$stmt->execute([$codigo, $id]);
if ($stmt->fetch()) {
    die('Ya existe otro producto con ese código. <a href="javascript:history.back()">Volver</a>');
}

$estadoRotacion = trim($_POST['estado_rotacion'] ?? 'Rotación Normal');

$valores = [
    'codigo' => $codigo,
    'estado_rotacion' => $estadoRotacion,
];
foreach ($campos as $clave => $def) {
    $valor = trim($_POST[$clave] ?? '');
    if (($def['tipo'] ?? '') === 'number') {
        $valores[$clave] = $valor === '' ? null : (float) str_replace(',', '.', $valor);
    } else {
        $valores[$clave] = $valor;
    }
}

// --- Imagen actual (para saber que reemplazar/borrar) ---
$imagenActual = '';
$imagenCentroActual = '';
if ($id > 0) {
    $stmtActual = $pdo->prepare('SELECT imagen, imagen_centro FROM redondos WHERE id = ?');
    $stmtActual->execute([$id]);
    $actual = $stmtActual->fetch();
    if ($actual) {
        $imagenActual = $actual['imagen'];
        $imagenCentroActual = $actual['imagen_centro'];
    }
}

function procesarImagen(string $campoArchivo, string $sufijo, string $codigoBase, string $actual, string $campoQuitar): string
{
    $carpeta = __DIR__ . '/../img/redondos/';
    $baseNombre = preg_replace('/[^A-Za-z0-9_-]/', '', $codigoBase);

    if (!empty($_FILES[$campoArchivo]['name']) && $_FILES[$campoArchivo]['error'] === UPLOAD_ERR_OK) {
        $tmp = $_FILES[$campoArchivo]['tmp_name'];
        $tamano = $_FILES[$campoArchivo]['size'];

        if ($tamano > 5 * 1024 * 1024) {
            die('La imagen supera los 5 MB permitidos. <a href="javascript:history.back()">Volver</a>');
        }

        $info = @getimagesize($tmp);
        $extensionesPermitidas = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!$info || !isset($extensionesPermitidas[$info['mime']])) {
            die('El archivo de imagen no es válido (solo JPG, PNG o WEBP). <a href="javascript:history.back()">Volver</a>');
        }
        $ext = $extensionesPermitidas[$info['mime']];

        // Si habia una imagen previa con otra extension, se elimina para no dejar huerfanos.
        if ($actual && $actual !== $baseNombre . $sufijo . '.' . $ext) {
            $viejo = $carpeta . $actual;
            if (is_file($viejo)) @unlink($viejo);
        }

        $nombreFinal = $baseNombre . $sufijo . '.' . $ext;
        if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);
        move_uploaded_file($tmp, $carpeta . $nombreFinal);
        return $nombreFinal;
    }

    if (!empty($_POST[$campoQuitar])) {
        if ($actual) {
            $viejo = $carpeta . $actual;
            if (is_file($viejo)) @unlink($viejo);
        }
        return '';
    }

    return $actual;
}

$valores['imagen'] = procesarImagen('imagen', '', $codigo, $imagenActual, 'quitar_imagen');
$valores['imagen_centro'] = procesarImagen('imagen_centro', '-centro', $codigo, $imagenCentroActual, 'quitar_imagen_centro');

if ($id > 0) {
    $set = [];
    foreach ($valores as $col => $v) {
        $set[] = "$col = :$col";
    }
    $sql = 'UPDATE redondos SET ' . implode(', ', $set) . ' WHERE id = :id';
    $valores['id'] = $id;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    header('Location: index.php?msg=actualizado');
} else {
    $cols = array_keys($valores);
    $placeholders = array_map(function ($c) { return ":$c"; }, $cols);
    $sql = 'INSERT INTO redondos (' . implode(', ', $cols) . ') VALUES (' . implode(', ', $placeholders) . ')';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    header('Location: index.php?msg=creado');
}
exit;
