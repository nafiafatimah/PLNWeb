// models/User.js
const db = require('../config/db'); // Mengimpor koneksi database

const User = {
    create: async (username, email, password) => {
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [username, email, password]); // Menjalankan query untuk menyimpan user baru
        return result; // Mengembalikan hasil dari insert
    },
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(query, [email]); // Menjalankan query untuk menemukan user berdasarkan email
        return rows[0]; // Mengembalikan user yang ditemukan atau undefined jika tidak ada
    }
};

module.exports = User; // Mengekspor model User
