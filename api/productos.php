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

    foreach ($filas as &$fila) {
        $fila['diametroPulg'] = $fila['diametroPulg'] !== null ? (float) $fila['diametroPulg'] : null;
    }
    unset($fila);

    echo json_encode($filas, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo cargar el catálogo.']);
}
