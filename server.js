const express = require('express');
const app = express();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; // Ganti dengan secret key kamu

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ===== Middleware Token Authentication =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ===== Login Endpoint =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.json({ success: false, message: 'DB error' });
    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET);
      res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
    } else {
      res.json({ success: false, message: 'Login gagal' });
    }
  });
});

// ===== Submit Checklist Mingguan =====
app.post('/submit-checklist', authenticateToken, async (req, res) => {
  const { minggu, checklist } = req.body;
  const user_id = req.user.id;

  try {
    const query = 'INSERT INTO checklists (user_id, minggu, checklist) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE checklist = ?';
    await db.execute(query, [user_id, minggu, checklist, checklist]);
    res.json({ message: 'Checklist submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checklist submission failed' });
  }
});

// ===== Upload Foto Profil =====
const profileStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, req.user.id + path.extname(file.originalname));
  }
});
const profileUpload = multer({ storage: profileStorage });

app.post('/upload-profile', authenticateToken, profileUpload.single('profile'), async (req, res) => {
  const user_id = req.user.id;
  const filename = req.file.filename;

  try {
    await db.execute('UPDATE users SET profile_picture = ? WHERE id = ?', [filename, user_id]);
    res.json({ message: 'Profile picture updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ===== Rekap Checklist (Admin) =====
app.get('/rekap', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const [rows] = await db.execute(`
      SELECT u.nama, u.username, u.profile_picture, c.minggu, c.checklist
      FROM users u
      LEFT JOIN checklists c ON u.id = c.user_id
      ORDER BY u.nama, c.minggu
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get rekap' });
  }
});

// ===== Rekap Bulanan =====
app.get('/rekap-bulanan/:bulan', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const bulan = parseInt(req.params.bulan);
  const year = new Date().getFullYear();

  try {
    const [users] = await db.execute('SELECT id, nama FROM users');
    const [checklists] = await db.execute(`
      SELECT user_id, minggu FROM checklists 
      WHERE MONTH(minggu) = ? AND YEAR(minggu) = ?
    `, [bulan, year]);

    const userChecklistCount = {};
    users.forEach(u => {
      userChecklistCount[u.id] = { nama: u.nama, total: 0 };
    });

    checklists.forEach(c => {
      if (userChecklistCount[c.user_id]) {
        userChecklistCount[c.user_id].total += 1;
      }
    });

    const hasil = Object.values(userChecklistCount).map(u => ({
      nama: u.nama,
      persentase: `${(u.total / 4 * 100).toFixed(0)}%`
    }));

    res.json(hasil);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal hitung rekap bulanan' });
  }
});

// ===== Start Server =====
app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
