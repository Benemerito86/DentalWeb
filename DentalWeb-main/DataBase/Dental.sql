-- DROP DATABASE IF EXISTS dental_app;
CREATE DATABASE IF NOT EXISTS dental_app;
USE dental_app;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) ,
dni VARCHAR(20),
  mail VARCHAR(255) NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
    antecedentes_medicos TEXT,
    rol ENUM('usuario', 'alumno', 'profesor', 'admin') DEFAULT 'usuario'
);

CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  mail VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  servicio VARCHAR(100) NOT NULL,
  antecedentes VARCHAR(255),
  inicio DATETIME NOT NULL,
  fin DATETIME NOT NULL
);


INSERT INTO usuarios (nombre,mail,contrasena,telefono,antecedentes_medicos,rol) VALUES
('Administrador', 'admin@ilerna.com', 'admin', '', '', 'admin');

select * from usuarios;