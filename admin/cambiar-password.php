<?php
$tituloPagina = 'Cambiar contraseña';
require_once __DIR__ . '/layout_inicio.php';

$pdo = obtenerConexion();
$mensaje = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificarCsrf();
    $actual = (string) ($_POST['actual'] ?? '');
    $nueva = (string) ($_POST['nueva'] ?? '');
    $repetir = (string) ($_POST['repetir'] ?? '');

    $stmt = $pdo->prepare('SELECT password_hash FROM admin_users WHERE id = ?');
    $stmt->execute([$_SESSION['admin_id']]);
    $fila = $stmt->fetch();

    if (!$fila || !password_verify($actual, $fila['password_hash'])) {
        $error = 'La contraseña actual no es correcta.';
    } elseif (strlen($nueva) < 8) {
        $error = 'La nueva contraseña debe tener al menos 8 caracteres.';
    } elseif ($nueva !== $repetir) {
        $error = 'Las contraseñas nuevas no coinciden.';
    } else {
        $nuevoHash = password_hash($nueva, PASSWORD_DEFAULT);
        $upd = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
        $upd->execute([$nuevoHash, $_SESSION['admin_id']]);
        $mensaje = 'Contraseña actualizada correctamente.';
    }
}
?>

<div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
        <div class="card-panel">
            <h1 class="h5 mb-3">Cambiar contraseña</h1>

            <?php if ($mensaje): ?><div class="alert alert-success"><?= htmlspecialchars($mensaje) ?></div><?php endif; ?>
            <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>

            <form method="post">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(tokenCsrf()) ?>">
                <div class="mb-3">
                    <label class="form-label">Contraseña actual</label>
                    <input type="password" name="actual" class="form-control" required autocomplete="current-password">
                </div>
                <div class="mb-3">
                    <label class="form-label">Nueva contraseña</label>
                    <input type="password" name="nueva" class="form-control" required minlength="8" autocomplete="new-password">
                </div>
                <div class="mb-3">
                    <label class="form-label">Repetir nueva contraseña</label>
                    <input type="password" name="repetir" class="form-control" required minlength="8" autocomplete="new-password">
                </div>
                <button type="submit" class="btn btn-primary">Actualizar contraseña</button>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/layout_fin.php'; ?>
