require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Verificación de variables de entorno
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT'];
const missingEnv = requiredEnv.filter(key => process.env[key] === undefined);

if (missingEnv.length > 0) {
  console.error('❌ Faltan variables de entorno:', missingEnv.join(', '));
  process.exit(1);
}

// Mostrar datos de conexión
console.log('Conectando con:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

connection.connect(err => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos local');
});

// Registro de usuario
app.post('/register', async (req, res) => {
  const { mail, contrasena } = req.body;

  if (!mail || !contrasena) {
    return res.status(400).json({ error: 'Faltan mail o contrasena' });
  }

  connection.query('SELECT * FROM usuarios WHERE mail = ?', [mail], async (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error interno' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'El mail ya está registrado' });
    }

    try {
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      connection.query(
        'INSERT INTO usuarios (mail, contrasena) VALUES (?, ?)',
        [mail, hashedPassword],
        (err, results) => {
          if (err) {
            console.error('Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al crear usuario' });
          }
          res.status(201).json({ message: 'Usuario creado con éxito', id: results.insertId });
        }
      );
    } catch (hashError) {
      console.error('Error al hashear contrasena:', hashError);
      return res.status(500).json({ error: 'Error interno' });
    }
  });
});

// Login de usuario
app.post('/login', (req, res) => {
  const { mail, contrasena } = req.body;

  if (!mail || !contrasena) {
    return res.status(400).json({ error: 'Faltan mail o contrasena' });
  }

  connection.query('SELECT * FROM usuarios WHERE mail = ?', [mail], async (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error interno' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);

    if (!validPassword) {
      return res.status(400).json({ error: 'Contrasena incorrecta' });
    }

    res.json({ message: 'Login exitoso', userId: user.id });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
