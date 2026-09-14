<?php
require_once __DIR__ . '/auth.php';
requerirLogin();
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}
verificarCsrf();

$id = (int) ($_POST['id'] ?? 0);
if ($id > 0) {
    $pdo = obtenerConexion();

    $stmt = $pdo->prepare('SELECT imagen, imagen_centro FROM redondos WHERE id = ?');
    $stmt->execute([$id]);
    $fila = $stmt->fetch();

    if ($fila) {
        $carpeta = __DIR__ . '/../img/redondos/';
        foreach ([$fila['imagen'], $fila['imagen_centro']] as $archivo) {
            if ($archivo && is_file($carpeta . $archivo)) {
                @unlink($carpeta . $archivo);
            }
        }
        $del = $pdo->prepare('DELETE FROM redondos WHERE id = ?');
        $del->execute([$id]);
    }
}

header('Location: index.php?msg=eliminado');
exit;
