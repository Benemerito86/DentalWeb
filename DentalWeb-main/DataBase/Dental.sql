-- Base de datos de Software Dental para Ilerna 
-- Componenntes: Miguel Benjumea Hidalgo, Fran Espin Figueroa, Franco Ponce De Leon, Loren Cruz Fernandez y Luis Capel Velázquez
DROP DATABASE IF EXISTS DentalSofware;
CREATE DATABASE DentalSofware;
USE DentalSofware;

-- Tabla de usuarios (pacientes, dentistas y administradores)
CREATE TABLE usuarios (
    dni VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    antecedentes_medicos TEXT,
    password VARCHAR(255) NOT NULL,
    rol ENUM('usuario', 'alumno','profesor', 'admin') DEFAULT 'usuario'
);

-- Tabla de citas
CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    tipo_servicio ENUM('limpieza', 'ortodoncia', 'retirada_suturas') NOT NULL,
    estado ENUM('reservada', 'cancelada') DEFAULT 'reservada',
    dni_usuario VARCHAR(10),
    FOREIGN KEY (dni_usuario) REFERENCES usuarios(dni)
);


-- Ejemplo de insertciones

-- Usuarios
INSERT INTO usuarios (dni, nombre, correo, telefono, antecedentes_medicos, password, rol) VALUES
('12345678A', 'Usuario', 'ana@example.com', '600123123', 'Alergia al ibuprofeno', '1234', 'usuario'),
('87654321B', 'Profesor', 'profesor@clinicadental.com', '600321321', '', 'profe', 'profesor'),
('87654321B', 'Alumno', 'alumno@clinicadental.com', '60032555', '', 'alumno', 'alumno'),
('11223344C', 'Admin', 'admin@clinicadental.com', '600000000', '', 'admin', 'admin');

-- Citas de prueba
INSERT INTO citas (fecha_hora, tipo_servicio, estado, dni_usuario) VALUES
('2025-06-10 10:00:00', 'limpieza', 'reservada', '12345678A'),
('2025-06-10 10:00:00', 'ortodoncia', 'reservada', '12345678A'),
('2025-06-10 11:00:00', 'retirada_suturas', 'reservada', '12345678A');
    

