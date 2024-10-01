// config/db.js
const mysql = require('mysql2/promise'); // Pastikan ini menggunakan mysql2/promise

// Membuat pool koneksi
const db = mysql.createPool({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'PLN_Web',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db; // Mengekspor pool koneksi



