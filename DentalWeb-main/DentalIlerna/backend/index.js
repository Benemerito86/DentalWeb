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

    // 🔽 Aquí devolvemos el rol también
    res.json({ message: 'Login exitoso', userId: user.id, rol: user.rol });
  });
});

// Eliminar usuario
app.delete('/delete-user/:id', (req, res) => {
  const userId = req.params.id;

  connection.query('DELETE FROM usuarios WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado con éxito' });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

app.get('/get-user/:id', (req, res) => {
  const id = req.params.id;
connection.query('SELECT id, nombre, dni, mail, telefono, antecedentes_medicos FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log('Usuario desde BD:', results[0]);
    res.json(results[0]);
  });
});


app.put('/update-user/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, dni, telefono, antecedentes } = req.body;  

  // Validar al menos un campo para actualizar
  if (![nombre, telefono, antecedentes, dni].some(v => v !== undefined)) {
    return res.status(400).json({ error: 'Al menos un campo debe ser enviado para actualizar' });
  }

  connection.query(
    'UPDATE usuarios SET nombre = ?, telefono = ?, antecedentes_medicos = ?, dni = ? WHERE id = ?',
    [nombre, telefono, antecedentes, dni, id], 
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al actualizar usuario' });
      }
      res.json({ message: 'Usuario actualizado correctamente' });
    }
  );
});

// Guardar una nueva cita
app.post('/add-cita', (req, res) => {
  const { nombre, dni, mail, telefono, servicio, antecedentes, inicio, fin } = req.body;

  if (!nombre || !dni || !mail || !telefono || !servicio || !inicio || !fin) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  connection.query(
    'INSERT INTO citas (nombre, dni, mail, telefono, servicio, antecedentes, inicio, fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nombre, dni, mail, telefono, servicio, antecedentes || 'Sin antecedentes', inicio, fin],
    (err, result) => {
      if (err) {
        console.error('❌ Error al guardar la cita:', err);
        return res.status(500).json({ error: 'Error al guardar la cita' });
      }
      res.status(201).json({ message: 'Cita guardada con éxito', id: result.insertId });
    }
  );
});

// Obtener todas las citas
app.get('/citas', (req, res) => {
  connection.query('SELECT * FROM citas', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener citas' });
    }
    res.json(results);
  });
});

// Eliminar una cita
app.delete('/delete-cita/:id', (req, res) => {
  const citaId = req.params.id;
  connection.query('DELETE FROM citas WHERE id = ?', [citaId], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar cita:', err);
      return res.status(500).json({ error: 'Error al eliminar cita' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita eliminada correctamente' });
  });
});

app.get('/citas', (req, res) => {
  connection.query(
    'SELECT id, nombre, dni, servicio, inicio AS start, fin AS end FROM citas',
    (err, results) => {
      if (err) {
        console.error('Error al obtener citas:', err);
        return res.status(500).json({ error: 'Error al obtener citas' });
      }

      const eventos = results.map(row => ({
        id: row.id,
        title: `${row.nombre} (${row.dni}) - ${row.servicio}`,
        start: row.start,
        end: row.end
      }));

      res.json(eventos);
    }
  );
});

// Guardar un día bloqueado
app.post('/add-bloqueo', (req, res) => {
  const { fecha } = req.body;

  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es obligatoria' });
  }

  connection.query(
    'INSERT INTO bloqueos (fecha) VALUES (?)',
    [fecha],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El día ya está bloqueado' });
        }
        console.error('❌ Error al guardar bloqueo:', err);
        return res.status(500).json({ error: 'Error al guardar bloqueo' });
      }
      res.status(201).json({ message: 'Día bloqueado con éxito', id: result.insertId });
    }
  );
});

// Obtener días bloqueados (formato para el calendario)
app.get('/bloqueos', (req, res) => {
  const query = 'SELECT id, fecha FROM bloqueos';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener bloqueos:', error);
      return res.status(500).json({ error: 'Error al obtener bloqueos' });
    }
    res.json(results); // debe enviar un array con bloqueos [{id, fecha}, ...]
  });
});


