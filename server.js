// server.js
const express = require('express');
const app = express();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.json({ success: false, message: 'DB error' });
    if (results.length > 0) {
      const user = results[0];
      res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    } else {
      res.json({ success: false, message: 'Login gagal' });
    }
  });
});
