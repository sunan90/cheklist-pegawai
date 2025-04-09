// db.js
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'checklist_db'
});
db.connect((err) => {
  if (err) throw err;
  console.log('Database connected');
});
module.exports = db;
