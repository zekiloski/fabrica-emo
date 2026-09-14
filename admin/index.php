<?php
$tituloPagina = 'Productos';
require_once __DIR__ . '/layout_inicio.php';

$pdo = obtenerConexion();

$busqueda = trim($_GET['q'] ?? '');
$pagina = max(1, (int) ($_GET['pagina'] ?? 1));
$porPagina = 20;
$offset = ($pagina - 1) * $porPagina;

$where = '';
$params = [];
if ($busqueda !== '') {
    $where = 'WHERE codigo LIKE ? OR descripcion LIKE ? OR tipo LIKE ?';
    $like = '%' . $busqueda . '%';
    $params = [$like, $like, $like];
}

$stmtCount = $pdo->prepare("SELECT COUNT(*) AS c FROM redondos $where");
$stmtCount->execute($params);
$total = (int) $stmtCount->fetch()['c'];
$totalPaginas = max(1, (int) ceil($total / $porPagina));

$sql = "SELECT id, codigo, descripcion, tipo, diametro_pulg, espesor, imagen, actualizado_en
        FROM redondos $where ORDER BY actualizado_en DESC, codigo ASC LIMIT $porPagina OFFSET $offset";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$productos = $stmt->fetchAll();

$mensaje = $_GET['msg'] ?? '';
?>

<div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
    <h1 class="h4 mb-0">Productos del catálogo</h1>
    <a href="form.php" class="btn btn-primary"><i class="fas fa-plus me-1"></i>Agregar producto</a>
</div>

<?php if ($mensaje === 'creado'): ?>
    <div class="alert alert-success">Producto creado correctamente.</div>
<?php elseif ($mensaje === 'actualizado'): ?>
    <div class="alert alert-success">Producto actualizado correctamente.</div>
<?php elseif ($mensaje === 'eliminado'): ?>
    <div class="alert alert-success">Producto eliminado.</div>
<?php endif; ?>

<div class="card-panel mb-3">
    <form method="get" class="d-flex gap-2">
        <input type="text" name="q" class="form-control" placeholder="Buscar por código, descripción o tipo..."
            value="<?= htmlspecialchars($busqueda) ?>">
        <button class="btn btn-outline-secondary" type="submit"><i class="fas fa-search"></i></button>
        <?php if ($busqueda !== ''): ?>
            <a href="index.php" class="btn btn-outline-secondary"><i class="fas fa-times"></i></a>
        <?php endif; ?>
    </form>
</div>

<div class="card-panel">
    <div class="table-responsive">
        <table class="table table-hover tabla-admin mb-0">
            <thead>
                <tr>
                    <th></th>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Diámetro</th>
                    <th>Espesor</th>
                    <th>Actualizado</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <?php if (!$productos): ?>
                    <tr><td colspan="8" class="text-center text-muted py-4">No se encontraron productos.</td></tr>
                <?php endif; ?>
                <?php foreach ($productos as $p): ?>
                    <tr>
                        <td>
                            <?php if ($p['imagen']): ?>
                                <img src="../img/redondos/<?= htmlspecialchars($p['imagen']) ?>" class="miniatura" alt="">
                            <?php else: ?>
                                <div class="miniatura d-flex align-items-center justify-content-center text-muted">
                                    <i class="fas fa-image"></i>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td class="fw-semi-bold text-primary"><?= htmlspecialchars($p['codigo']) ?></td>
                        <td><?= htmlspecialchars($p['descripcion']) ?></td>
                        <td><?= htmlspecialchars($p['tipo']) ?></td>
                        <td><?= $p['diametro_pulg'] !== null ? htmlspecialchars($p['diametro_pulg']) . '"' : '-' ?></td>
                        <td><?= htmlspecialchars($p['espesor'] ?: '-') ?></td>
                        <td class="text-muted small"><?= htmlspecialchars($p['actualizado_en']) ?></td>
                        <td class="text-end">
                            <a href="form.php?id=<?= (int) $p['id'] ?>" class="btn btn-sm btn-outline-secondary" title="Editar">
                                <i class="fas fa-pen"></i>
                            </a>
                            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar"
                                data-id="<?= (int) $p['id'] ?>" data-codigo="<?= htmlspecialchars($p['codigo']) ?>" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php if ($totalPaginas > 1): ?>
    <nav class="mt-3">
        <ul class="pagination">
            <?php for ($i = 1; $i <= $totalPaginas; $i++): ?>
                <li class="page-item <?= $i === $pagina ? 'active' : '' ?>">
                    <a class="page-link" href="?pagina=<?= $i ?>&q=<?= urlencode($busqueda) ?>"><?= $i ?></a>
                </li>
            <?php endfor; ?>
        </ul>
    </nav>
<?php endif; ?>

<form id="formEliminar" method="post" action="eliminar.php" style="display:none;">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(tokenCsrf()) ?>">
    <input type="hidden" name="id" id="eliminarId">
</form>

<script>
document.querySelectorAll('.btn-eliminar').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var codigo = btn.getAttribute('data-codigo');
        if (confirm('¿Eliminar el producto "' + codigo + '"? Esta acción no se puede deshacer.')) {
            document.getElementById('eliminarId').value = btn.getAttribute('data-id');
            document.getElementById('formEliminar').submit();
        }
    });
});
</script>

<?php require_once __DIR__ . '/layout_fin.php'; ?>
