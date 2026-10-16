<?php
$tituloPagina = 'Carga masiva de imágenes';
require_once __DIR__ . '/layout_inicio.php';
require_once __DIR__ . '/imagenes.php';

$pdo = obtenerConexion();
$resultados = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificarCsrf();

    $nombres = $_FILES['imagenes']['name'] ?? [];
    $total = count($nombres);

    for ($i = 0; $i < $total; $i++) {
        $nombreOriginal = $nombres[$i];
        if ($nombreOriginal === '') continue; // input vacío

        $error = $_FILES['imagenes']['error'][$i];
        $tmp = $_FILES['imagenes']['tmp_name'][$i];
        $tamano = (int) $_FILES['imagenes']['size'][$i];

        $fila = ['archivo' => $nombreOriginal, 'estado' => '', 'detalle' => ''];

        if ($error !== UPLOAD_ERR_OK) {
            $fila['estado'] = 'error';
            $fila['detalle'] = ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE)
                ? 'El archivo es demasiado grande para el servidor.'
                : 'Error al subir el archivo (código ' . $error . ').';
            $resultados[] = $fila;
            continue;
        }

        $deteccion = detectarCodigoDesdeNombreArchivo($nombreOriginal);
        $codigo = $deteccion['codigo'];
        $esCentro = $deteccion['esCentro'];
        $fila['codigo'] = $codigo;
        $fila['tipo'] = $esCentro ? 'Imagen de centro' : 'Imagen general';

        if ($codigo === '') {
            $fila['estado'] = 'error';
            $fila['detalle'] = 'No se pudo leer un código válido en el nombre del archivo.';
            $resultados[] = $fila;
            continue;
        }

        $stmt = $pdo->prepare('SELECT id, imagen, imagen_centro FROM redondos WHERE codigo = ? LIMIT 1');
        $stmt->execute([$codigo]);
        $producto = $stmt->fetch();

        if (!$producto) {
            $fila['estado'] = 'no_encontrado';
            $fila['detalle'] = 'No existe ningún producto con el código "' . $codigo . '".';
            $resultados[] = $fila;
            continue;
        }

        $actual = $esCentro ? $producto['imagen_centro'] : $producto['imagen'];
        $sufijo = $esCentro ? '-centro' : '';
        $guardado = validarYGuardarImagen($tmp, $tamano, $codigo, $sufijo, $actual);

        if (!$guardado['ok']) {
            $fila['estado'] = 'error';
            $fila['detalle'] = $guardado['error'];
            $resultados[] = $fila;
            continue;
        }

        $campo = $esCentro ? 'imagen_centro' : 'imagen';
        $upd = $pdo->prepare("UPDATE redondos SET $campo = ? WHERE id = ?");
        $upd->execute([$guardado['archivo'], $producto['id']]);

        $fila['estado'] = 'ok';
        $fila['detalle'] = 'Guardada como ' . $guardado['archivo'];
        $resultados[] = $fila;
    }
}

$exitosos = count(array_filter($resultados, function ($r) { return $r['estado'] === 'ok'; }));
$noEncontrados = count(array_filter($resultados, function ($r) { return $r['estado'] === 'no_encontrado'; }));
$conError = count(array_filter($resultados, function ($r) { return $r['estado'] === 'error'; }));
?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <h1 class="h4 mb-0">Carga masiva de imágenes</h1>
    <div class="d-flex gap-2">
        <a href="diagnostico-imagenes.php" class="btn btn-outline-secondary btn-sm">
            <i class="fas fa-stethoscope me-1"></i>Diagnóstico
        </a>
        <a href="index.php" class="btn btn-outline-secondary btn-sm"><i class="fas fa-arrow-left me-1"></i>Volver</a>
    </div>
</div>

<div class="card-panel mb-3">
    <p class="mb-2">Seleccioná varias imágenes a la vez. El sistema reconoce a qué producto corresponde cada una
        <strong>por el nombre del archivo</strong>, igual a como ya se guardan en el servidor:</p>
    <ul class="mb-2">
        <li><code>ONC331200.jpg</code> → imagen general del código <strong>ONC331200</strong></li>
        <li><code>ONC331200-centro.jpg</code> → esquema de centro del código <strong>ONC331200</strong></li>
    </ul>
    <p class="mb-0 text-muted small">Formatos aceptados: JPG, PNG o WEBP. Máximo 5 MB por archivo.
        Si tenés muchísimas imágenes, subilas en tandas de hasta ~20 por vez para evitar límites del servidor.</p>
</div>

<form method="post" enctype="multipart/form-data" class="card-panel mb-3">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(tokenCsrf()) ?>">
    <div class="mb-3">
        <label class="form-label">Imágenes a subir</label>
        <input type="file" name="imagenes[]" class="form-control" accept=".jpg,.jpeg,.png,.webp" multiple required>
    </div>
    <button type="submit" class="btn btn-primary"><i class="fas fa-upload me-1"></i>Subir y asignar</button>
</form>

<?php if ($resultados): ?>
    <div class="card-panel">
        <h2 class="h6 mb-3">
            Resultado: <span class="text-success"><?= $exitosos ?> actualizadas</span>,
            <span class="text-warning"><?= $noEncontrados ?> sin producto coincidente</span>,
            <span class="text-danger"><?= $conError ?> con error</span>
        </h2>
        <div class="table-responsive">
            <table class="table table-hover tabla-admin mb-0">
                <thead>
                    <tr>
                        <th>Archivo</th>
                        <th>Código detectado</th>
                        <th>Tipo</th>
                        <th>Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($resultados as $r): ?>
                        <tr>
                            <td><?= htmlspecialchars($r['archivo']) ?></td>
                            <td class="fw-semi-bold text-primary"><?= htmlspecialchars($r['codigo'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($r['tipo'] ?? '-') ?></td>
                            <td>
                                <?php if ($r['estado'] === 'ok'): ?>
                                    <span class="badge bg-success"><?= htmlspecialchars($r['detalle']) ?></span>
                                <?php elseif ($r['estado'] === 'no_encontrado'): ?>
                                    <span class="badge bg-warning text-dark"><?= htmlspecialchars($r['detalle']) ?></span>
                                <?php else: ?>
                                    <span class="badge bg-danger"><?= htmlspecialchars($r['detalle']) ?></span>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/layout_fin.php'; ?>
