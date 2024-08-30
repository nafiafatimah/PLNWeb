const mysql = require('mysql');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'PLN_Web'
});

// Membuat koneksi ke database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Mengekspos koneksi database
module.exports = connection;
