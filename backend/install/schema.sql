CREATE DATABASE IF NOT EXISTS corimexo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corimexo;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'admin',
  token VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_conversaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_token VARCHAR(64) NOT NULL UNIQUE,
  visitor_nombre VARCHAR(150) DEFAULT 'Visitante',
  visitor_email VARCHAR(150) NULL,
  estado ENUM('abierta','cerrada') DEFAULT 'abierta',
  agente_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agente_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE chat_mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  remitente ENUM('visitante','admin') NOT NULL,
  nombre_admin VARCHAR(150) NULL,
  mensaje TEXT NOT NULL,
  leido TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES chat_conversaciones(id) ON DELETE CASCADE
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NULL,
  material VARCHAR(150) NULL,
  descripcion TEXT NULL,
  imagen VARCHAR(255) NULL,
  imagen2 VARCHAR(255) NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  destacado TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuario admin de prueba: correo admin@corimexo.com / contraseña Corimexo2026
-- (el hash de abajo corresponde a esa contraseña, generado con password_hash PHP)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Administrador Corimexo', 'admin@corimexo.com', '$2y$10$hMIyWbxIKAESFo3W9jmtpOiJbIjsgHJXB8/8LsfY8Hn9iqwaRmPKa', 'admin');
