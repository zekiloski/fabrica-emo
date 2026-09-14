<?php
require_once __DIR__ . '/auth.php';
requerirLogin();
require_once __DIR__ . '/db.php';
$tituloPagina = $tituloPagina ?? 'Panel de administración';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title><?= htmlspecialchars($tituloPagina) ?> - Admin Oncativo SA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="admin.css" rel="stylesheet">
</head>
<body class="admin-body">
    <nav class="navbar navbar-expand-lg admin-navbar px-3">
        <a class="navbar-brand d-flex align-items-center gap-2" href="index.php">
            <img src="../img/logo.png" alt="" height="34">
            <span class="fw-bold">Panel admin</span>
        </a>
        <div class="ms-auto d-flex align-items-center gap-3">
            <span class="text-white-50 small d-none d-sm-inline">
                <i class="fas fa-user-circle me-1"></i><?= htmlspecialchars($_SESSION['admin_usuario'] ?? '') ?>
            </span>
            <a href="../BuscadorCodigos.html" target="_blank" class="btn btn-sm btn-outline-light">
                <i class="fas fa-external-link-alt me-1"></i>Ver sitio
            </a>
            <a href="cambiar-password.php" class="btn btn-sm btn-outline-light">
                <i class="fas fa-key me-1"></i>Contraseña
            </a>
            <a href="logout.php" class="btn btn-sm btn-warning">
                <i class="fas fa-sign-out-alt me-1"></i>Salir
            </a>
        </div>
    </nav>
    <main class="container-fluid py-4 px-3 px-md-4">
