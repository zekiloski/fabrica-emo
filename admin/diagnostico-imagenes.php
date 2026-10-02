<?php
$tituloPagina = 'Diagnóstico de imágenes';
require_once __DIR__ . '/layout_inicio.php';

$pdo = obtenerConexion();
$carpeta = __DIR__ . '/../img/redondos/';

$stmt = $pdo->query('SELECT id, codigo, descripcion, imagen, imagen_centro FROM redondos ORDER BY codigo ASC');
$productos = $stmt->fetchAll();

$faltantes = [];
foreach ($productos as $p) {
    $faltaImagen = $p['imagen'] && !is_file($carpeta . $p['imagen']);
    $faltaImagenCentro = $p['imagen_centro'] && !is_file($carpeta . $p['imagen_centro']);
    if ($faltaImagen || $faltaImagenCentro) {
        $p['faltaImagen'] = $faltaImagen;
        $p['faltaImagenCentro'] = $faltaImagenCentro;
        $faltantes[] = $p;
    }
}
?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <h1 class="h4 mb-0">Diagnóstico de imágenes</h1>
    <a href="index.php" class="btn btn-outline-secondary btn-sm"><i class="fas fa-arrow-left me-1"></i>Volver</a>
</div>

<div class="card-panel mb-3">
    <p class="mb-0">
        Revisa los <?= count($productos) ?> productos y compara el nombre de archivo guardado en la base
        con lo que realmente existe en <code>img/redondos/</code> en este servidor.
        Se encontraron <strong><?= count($faltantes) ?></strong> productos con una imagen referenciada
        en la base que no tiene el archivo correspondiente.
    </p>
</div>

<?php if ($faltantes): ?>
<div class="card-panel">
    <div class="table-responsive">
        <table class="table table-hover tabla-admin mb-0">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Imagen</th>
                    <th>Imagen centro</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($faltantes as $p): ?>
                    <tr>
                        <td class="fw-semi-bold text-primary"><?= htmlspecialchars($p['codigo']) ?></td>
                        <td><?= htmlspecialchars($p['descripcion']) ?></td>
                        <td>
                            <?php if ($p['faltaImagen']): ?>
                                <span class="badge bg-danger"><?= htmlspecialchars($p['imagen']) ?> (falta archivo)</span>
                            <?php elseif ($p['imagen']): ?>
                                <span class="text-muted small">OK</span>
                            <?php else: ?>
                                <span class="text-muted small">-</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if ($p['faltaImagenCentro']): ?>
                                <span class="badge bg-danger"><?= htmlspecialchars($p['imagen_centro']) ?> (falta archivo)</span>
                            <?php elseif ($p['imagen_centro']): ?>
                                <span class="text-muted small">OK</span>
                            <?php else: ?>
                                <span class="text-muted small">-</span>
                            <?php endif; ?>
                        </td>
                        <td class="text-end">
                            <a href="form.php?id=<?= (int) $p['id'] ?>" class="btn btn-sm btn-outline-secondary" title="Editar">
                                <i class="fas fa-pen me-1"></i>Volver a subir
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<?php else: ?>
    <div class="alert alert-success">No falta ningún archivo de imagen. Todo lo que está referenciado en la base existe en el servidor.</div>
<?php endif; ?>

<?php require_once __DIR__ . '/layout_fin.php'; ?>
