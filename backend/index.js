require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al consultar' });
    res.json(resultados);
  });
});

app.post('/usuarios', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

  db.query('INSERT INTO usuarios (nombre) VALUES (?)', [nombre], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al insertar' });
    res.json({ id: resultado.insertId, nombre });
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
