<?php
$tituloPagina = 'Editar producto';
require_once __DIR__ . '/layout_inicio.php';

$pdo = obtenerConexion();
$campos = require __DIR__ . '/campos.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$producto = array_fill_keys(array_merge(['id', 'codigo'], array_keys($campos), ['estado_rotacion', 'imagen', 'imagen_centro']), '');

if ($id > 0) {
    $stmt = $pdo->prepare('SELECT * FROM redondos WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $fila = $stmt->fetch();
    if (!$fila) {
        header('Location: index.php');
        exit;
    }
    $producto = array_merge($producto, $fila);
    $tituloPagina = 'Editar ' . $producto['codigo'];
} else {
    $tituloPagina = 'Nuevo producto';
}

$gruposOrden = [];
foreach ($campos as $clave => $def) {
    $gruposOrden[$def['grupo']][$clave] = $def;
}

$estadosRotacion = ['Rotación Normal', 'Baja Rotación - Requiere Autorización para Nota de Venta'];
?>

<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0"><?= htmlspecialchars($tituloPagina) ?></h1>
    <a href="index.php" class="btn btn-outline-secondary btn-sm"><i class="fas fa-arrow-left me-1"></i>Volver</a>
</div>

<form method="post" action="guardar.php" enctype="multipart/form-data" class="card-panel">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(tokenCsrf()) ?>">
    <input type="hidden" name="id" value="<?= (int) $producto['id'] ?>">

    <div class="row g-3">
        <div class="col-md-4">
            <label class="form-label">Código de artículo *</label>
            <input type="text" name="codigo" class="form-control" required maxlength="50"
                value="<?= htmlspecialchars($producto['codigo']) ?>">
        </div>
        <div class="col-md-8">
            <label class="form-label">Estado / Rotación <span class="text-muted small">(uso interno, no se muestra en el buscador público)</span></label>
            <select name="estado_rotacion" class="form-select">
                <?php foreach ($estadosRotacion as $opcion): ?>
                    <option value="<?= htmlspecialchars($opcion) ?>" <?= $producto['estado_rotacion'] === $opcion ? 'selected' : '' ?>>
                        <?= htmlspecialchars($opcion) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <?php foreach ($gruposOrden as $grupo => $camposGrupo): ?>
        <div class="form-section-title"><?= htmlspecialchars($grupo) ?></div>
        <div class="row g-3">
            <?php foreach ($camposGrupo as $clave => $def): ?>
                <div class="col-md-4">
                    <label class="form-label"><?= htmlspecialchars($def['label']) ?></label>
                    <?php if (($def['tipo'] ?? '') === 'textarea'): ?>
                        <textarea name="<?= $clave ?>" class="form-control" rows="3"><?= htmlspecialchars($producto[$clave] ?? '') ?></textarea>
                    <?php elseif (($def['tipo'] ?? '') === 'number'): ?>
                        <input type="number" step="0.01" name="<?= $clave ?>" class="form-control"
                            value="<?= htmlspecialchars($producto[$clave] ?? '') ?>">
                    <?php else: ?>
                        <input type="text" name="<?= $clave ?>" class="form-control"
                            value="<?= htmlspecialchars($producto[$clave] ?? '') ?>">
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endforeach; ?>

    <div class="form-section-title">Imágenes</div>
    <div class="row g-3">
        <div class="col-md-6">
            <label class="form-label">Imagen general del producto</label>
            <?php if ($producto['imagen']): ?>
                <div class="mb-2">
                    <img src="<?= htmlspecialchars(urlImagen($producto['imagen'])) ?>" class="miniatura" style="width:90px;height:90px;" alt="">
                    <div class="form-check form-check-inline ms-2">
                        <input class="form-check-input" type="checkbox" name="quitar_imagen" id="quitarImagen" value="1">
                        <label class="form-check-label small" for="quitarImagen">Quitar imagen actual</label>
                    </div>
                </div>
            <?php endif; ?>
            <input type="file" name="imagen" class="form-control" accept=".jpg,.jpeg,.png,.webp">
            <div class="form-text">JPG, PNG o WEBP. Máximo 5 MB.</div>
        </div>
        <div class="col-md-6">
            <label class="form-label">Esquema / imagen del código de centro</label>
            <?php if ($producto['imagen_centro']): ?>
                <div class="mb-2">
                    <img src="<?= htmlspecialchars(urlImagen($producto['imagen_centro'])) ?>" class="miniatura" style="width:90px;height:90px;" alt="">
                    <div class="form-check form-check-inline ms-2">
                        <input class="form-check-input" type="checkbox" name="quitar_imagen_centro" id="quitarImagenCentro" value="1">
                        <label class="form-check-label small" for="quitarImagenCentro">Quitar imagen actual</label>
                    </div>
                </div>
            <?php endif; ?>
            <input type="file" name="imagen_centro" class="form-control" accept=".jpg,.jpeg,.png,.webp">
            <div class="form-text">JPG, PNG o WEBP. Máximo 5 MB.</div>
        </div>
    </div>

    <div class="mt-4 d-flex gap-2">
        <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i>Guardar</button>
        <a href="index.php" class="btn btn-outline-secondary">Cancelar</a>
    </div>
</form>

<?php require_once __DIR__ . '/layout_fin.php'; ?>
