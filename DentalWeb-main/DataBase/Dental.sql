
CREATE DATABASE IF NOT EXISTS dental_app;
USE dental_app;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(100) ,
  mail VARCHAR(255) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
	antecedentes_medicos TEXT,
	rol ENUM('usuario', 'alumno', 'profesor', 'admin') DEFAULT 'usuario'
);

INSERT INTO usuarios (nombre,mail,contrasena,telefono,antecedentes_medicos,rol) VALUES
('Administrador', 'admin@ilerna.com', 'admin', '', '', 'admin');

select * from usuarios;