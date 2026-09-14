<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

if (usuarioLogueado()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verificarCsrf();
    $usuario = trim($_POST['usuario'] ?? '');
    $password = (string) ($_POST['password'] ?? '');

    if ($usuario === '' || $password === '') {
        $error = 'Completá usuario y contraseña.';
    } else {
        $pdo = obtenerConexion();
        $stmt = $pdo->prepare('SELECT id, password_hash, nombre FROM admin_users WHERE usuario = ? LIMIT 1');
        $stmt->execute([$usuario]);
        $fila = $stmt->fetch();

        if ($fila && password_verify($password, $fila['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = $fila['id'];
            $_SESSION['admin_usuario'] = $usuario;
            $_SESSION['admin_nombre'] = $fila['nombre'];

            $upd = $pdo->prepare('UPDATE admin_users SET ultimo_acceso = NOW() WHERE id = ?');
            $upd->execute([$fila['id']]);

            header('Location: index.php');
            exit;
        }

        $error = 'Usuario o contraseña incorrectos.';
    }
}

$csrf = tokenCsrf();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Acceso administrador - Oncativo SA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="admin.css" rel="stylesheet">
</head>
<body class="admin-login-body">
    <div class="admin-login-card">
        <img src="../img/logo.png" alt="Oncativo S.A." class="mb-3" style="max-width:200px;">
        <h1 class="h5 mb-4">Panel de administración</h1>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form method="post" novalidate>
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>">
            <div class="mb-3 text-start">
                <label class="form-label small">Usuario</label>
                <input type="text" name="usuario" class="form-control" required autofocus autocomplete="username">
            </div>
            <div class="mb-3 text-start">
                <label class="form-label small">Contraseña</label>
                <input type="password" name="password" class="form-control" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary w-100">Ingresar</button>
        </form>
    </div>
</body>
</html>
