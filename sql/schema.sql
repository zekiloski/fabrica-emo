-- Esquema de la base de datos del catálogo de discos/redondos.
-- Ejecutar una sola vez contra la base creada en el hosting.

CREATE TABLE IF NOT EXISTS redondos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL DEFAULT '',
    tipo VARCHAR(100) NOT NULL DEFAULT '',
    diametro_pulg DECIMAL(6,2) NULL,
    espesor VARCHAR(50) NOT NULL DEFAULT '',
    concavidad VARCHAR(50) NOT NULL DEFAULT '',
    acorazado VARCHAR(50) NOT NULL DEFAULT '',
    cod_centro VARCHAR(50) NOT NULL DEFAULT '',
    desc_centro VARCHAR(255) NOT NULL DEFAULT '',
    forma_central VARCHAR(100) NOT NULL DEFAULT '',
    medida_centro VARCHAR(50) NOT NULL DEFAULT '',
    cant_l1 VARCHAR(20) NOT NULL DEFAULT '',
    forma_l1 VARCHAR(100) NOT NULL DEFAULT '',
    medida_l1 VARCHAR(50) NOT NULL DEFAULT '',
    fresado_l1 VARCHAR(100) NOT NULL DEFAULT '',
    diam_l1 VARCHAR(50) NOT NULL DEFAULT '',
    cant_l2 VARCHAR(20) NOT NULL DEFAULT '',
    forma_l2 VARCHAR(100) NOT NULL DEFAULT '',
    medida_l2 VARCHAR(50) NOT NULL DEFAULT '',
    fresado_l2 VARCHAR(100) NOT NULL DEFAULT '',
    diam_l2 VARCHAR(50) NOT NULL DEFAULT '',
    cant_muescas VARCHAR(20) NOT NULL DEFAULT '',
    filo VARCHAR(150) NOT NULL DEFAULT '',
    ancho_labor VARCHAR(100) NOT NULL DEFAULT '',
    planos VARCHAR(20) NOT NULL DEFAULT '',
    observaciones TEXT NULL,
    maquina VARCHAR(255) NOT NULL DEFAULT '',
    imagen VARCHAR(255) NOT NULL DEFAULT '',
    imagen_centro VARCHAR(255) NOT NULL DEFAULT '',
    -- Uso interno: nunca se expone en api/productos.php (buscador publico).
    estado_rotacion VARCHAR(150) NOT NULL DEFAULT 'Rotación Normal',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_codigo (codigo),
    KEY idx_tipo (tipo),
    KEY idx_diametro (diametro_pulg)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL DEFAULT '',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME NULL,
    UNIQUE KEY uk_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
