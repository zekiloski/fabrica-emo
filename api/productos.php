<?php
// Endpoint público de solo lectura para el buscador de códigos.
// Nunca expone estado_rotacion (uso interno) ni datos administrativos.

require_once __DIR__ . '/../admin/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');

try {
    $pdo = obtenerConexion();
    $sql = 'SELECT
        codigo, descripcion, tipo,
        diametro_pulg AS diametroPulg,
        espesor, concavidad, acorazado,
        cod_centro AS codCentro,
        desc_centro AS descCentro,
        forma_central AS formaCentral,
        medida_centro AS medidaCentro,
        cant_l1 AS cantL1, forma_l1 AS formaL1, medida_l1 AS medidaL1, fresado_l1 AS fresadoL1, diam_l1 AS diamL1,
        cant_l2 AS cantL2, forma_l2 AS formaL2, medida_l2 AS medidaL2, fresado_l2 AS fresadoL2, diam_l2 AS diamL2,
        cant_muescas AS cantMuescas,
        filo, ancho_labor AS anchoLabor, planos, observaciones, maquina,
        imagen, imagen_centro AS imagenCentro
    FROM redondos
    ORDER BY codigo ASC';

    $stmt = $pdo->query($sql);
    $filas = $stmt->fetchAll();
    $carpetaImagenes = __DIR__ . '/../img/redondos/';

    foreach ($filas as &$fila) {
        $fila['diametroPulg'] = $fila['diametroPulg'] !== null ? (float) $fila['diametroPulg'] : null;
        // Cache-buster basado en la fecha real del archivo (no en la fila de la
        // base): el nombre de archivo no cambia al reemplazar una imagen, así
        // que la fecha de la fila tampoco cambia si ningún otro campo se editó.
        if ($fila['imagen']) {
            $ruta = $carpetaImagenes . $fila['imagen'];
            $fila['imagen'] .= '?v=' . (is_file($ruta) ? filemtime($ruta) : time());
        }
        if ($fila['imagenCentro']) {
            $ruta = $carpetaImagenes . $fila['imagenCentro'];
            $fila['imagenCentro'] .= '?v=' . (is_file($ruta) ? filemtime($ruta) : time());
        }
    }
    unset($fila);

    echo json_encode($filas, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo cargar el catálogo.']);
}
