<?php
require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_name(ADMIN_SESSION_NAME);
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
}

function usuarioLogueado(): bool
{
    return !empty($_SESSION['admin_id']);
}

function requerirLogin(): void
{
    if (!usuarioLogueado()) {
        header('Location: login.php');
        exit;
    }
}

function tokenCsrf(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verificarCsrf(): void
{
    $enviado = $_POST['csrf_token'] ?? '';
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $enviado)) {
        http_response_code(403);
        die('Token de seguridad inválido. Volvé a intentarlo desde el panel.');
    }
}
