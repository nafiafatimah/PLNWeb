// models/dataPelanggan.js

const db = require('../config/db'); // Mengimpor koneksi database

// CREATE - Menambahkan data pelanggan
exports.createDataPelanggan = async (data) => {
    const query = 'INSERT INTO Data_Pelanggan (IDPEL, Nama_Pelanggan, Email, No_Tlf) VALUES (?, ?, ?, ?)';
    const [results] = await db.query(query, [data.IDPEL, data.Nama_Pelanggan, data.Email, data.No_Tlf]);
    return results.insertId; // Mengembalikan ID dari data yang baru ditambahkan
};

// READ (all) - Mengambil semua data pelanggan
exports.getAllDataPelanggan = async () => {
    const query = 'SELECT * FROM Data_Pelanggan';
    const [results] = await db.query(query);
    return results; // Mengembalikan semua data pelanggan
};

// READ (by ID) - Mengambil data pelanggan berdasarkan IDPEL
exports.getDataPelangganById = async (id) => {
    const query = 'SELECT * FROM Data_Pelanggan WHERE IDPEL = ?';
    const [results] = await db.query(query, [id]);
    if (results.length === 0) throw new Error('Data not found'); // Menghasilkan error jika tidak ada data
    return results[0]; // Mengembalikan data pelanggan yang ditemukan
};

// UPDATE - Mengupdate data pelanggan berdasarkan IDPEL
exports.updateDataPelanggan = async (id, data) => {
    const query = 'UPDATE Data_Pelanggan SET Nama_Pelanggan = ?, Email = ?, No_Tlf = ? WHERE IDPEL = ?';
    const [results] = await db.query(query, [data.Nama_Pelanggan, data.Email, data.No_Tlf, id]);
    return results.affectedRows; // Mengembalikan jumlah baris yang terpengaruh
};

// DELETE - Menghapus data pelanggan berdasarkan IDPEL
exports.deleteDataPelanggan = async (id) => {
    const query = 'DELETE FROM Data_Pelanggan WHERE IDPEL = ?';
    const [results] = await db.query(query, [id]);
    return results.affectedRows; // Mengembalikan jumlah baris yang terhapus
};

// Mengecek apakah IDPEL sudah ada di database
exports.isIDPELExist = async (IDPEL) => {
    const query = 'SELECT COUNT(*) as count FROM Data_Pelanggan WHERE IDPEL = ?';
    const [results] = await db.query(query, [IDPEL]);
    return results[0].count > 0; // Mengembalikan true jika IDPEL sudah ada, false jika belum
};

// Mencari data pelanggan berdasarkan nama
exports.searchDataPelanggan = async (query) => {
    const sql = 'SELECT * FROM Data_Pelanggan WHERE Nama_Pelanggan LIKE ?';
    const [results] = await db.query(sql, [`%${query}%`]); // Menambahkan wildcard untuk pencarian
    return results; // Mengembalikan hasil pencarian
};
