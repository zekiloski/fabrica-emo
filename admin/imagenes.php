<?php
// Lógica compartida para validar y guardar una imagen de producto.
// La usan guardar.php (carga individual) y subir-imagenes.php (carga masiva).

function validarYGuardarImagen(string $tmpPath, int $tamano, string $nombreBase, string $sufijo, string $actual): array
{
    $carpeta = __DIR__ . '/../img/redondos/';
    $baseNombre = preg_replace('/[^A-Za-z0-9_-]/', '', $nombreBase);

    if ($baseNombre === '') {
        return ['ok' => false, 'error' => 'No se pudo determinar un nombre de archivo válido a partir del código.'];
    }

    if ($tamano > 5 * 1024 * 1024) {
        return ['ok' => false, 'error' => 'La imagen supera los 5 MB permitidos.'];
    }

    $info = @getimagesize($tmpPath);
    $extensionesPermitidas = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!$info || !isset($extensionesPermitidas[$info['mime']])) {
        return ['ok' => false, 'error' => 'El archivo no es una imagen válida (solo JPG, PNG o WEBP).'];
    }
    $ext = $extensionesPermitidas[$info['mime']];

    // Si había una imagen previa con otra extensión, se elimina para no dejar huérfanos.
    if ($actual && $actual !== $baseNombre . $sufijo . '.' . $ext) {
        $viejo = $carpeta . $actual;
        if (is_file($viejo)) @unlink($viejo);
    }

    $nombreFinal = $baseNombre . $sufijo . '.' . $ext;
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);
    if (!is_writable($carpeta)) {
        return ['ok' => false, 'error' => 'La carpeta img/redondos no tiene permisos de escritura en el servidor.'];
    }
    if (!move_uploaded_file($tmpPath, $carpeta . $nombreFinal)) {
        return ['ok' => false, 'error' => 'No se pudo guardar la imagen en el servidor (falló al mover el archivo subido).'];
    }
    return ['ok' => true, 'archivo' => $nombreFinal];
}

/**
 * A partir de un nombre de archivo (sin ruta), detecta a qué código de
 * producto corresponde y si es la imagen general o la del centro.
 * "ONC331200.jpg" -> codigo=ONC331200, centro=false
 * "ONC331200-centro.jpg" -> codigo=ONC331200, centro=true
 */
function detectarCodigoDesdeNombreArchivo(string $nombreArchivo): array
{
    $sinExtension = pathinfo($nombreArchivo, PATHINFO_FILENAME);
    $sinExtension = trim($sinExtension);
    if (preg_match('/^(.+)[-_ ]centro$/i', $sinExtension, $m)) {
        return ['codigo' => trim($m[1]), 'esCentro' => true];
    }
    return ['codigo' => $sinExtension, 'esCentro' => false];
}
