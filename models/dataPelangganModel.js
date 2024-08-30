const db = require('../config/db');

// CREATE - Menambahkan data pelanggan
exports.createDataPelanggan = (data, callback) => {
    const query = 'INSERT INTO Data_Pelanggan (IDPEL, Nama_Pelanggan, Email, No_Tlf) VALUES (?, ?, ?, ?)';
    db.query(query, [data.IDPEL, data.Nama_Pelanggan, data.Email, data.No_Tlf], (err, results) => {
        if (err) return callback(err);
        callback(null, results.insertId);
    });
};

// READ (all) - Mengambil semua data pelanggan
exports.getAllDataPelanggan = (callback) => {
    const query = 'SELECT * FROM Data_Pelanggan';
    db.query(query, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// READ (by ID) - Mengambil data pelanggan berdasarkan ID
exports.getDataPelangganById = (id, callback) => {
    const query = 'SELECT * FROM Data_Pelanggan WHERE IDPEL = ?';
    db.query(query, [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error('Data not found'));
        callback(null, results[0]);
    });
};

// UPDATE - Mengupdate data pelanggan
exports.updateDataPelanggan = (id, data, callback) => {
    const query = 'UPDATE Data_Pelanggan SET Nama_Pelanggan = ?, Email = ?, No_Tlf = ? WHERE IDPEL = ?';
    db.query(query, [data.Nama_Pelanggan, data.Email, data.No_Tlf, id], (err, results) => {
        if (err) return callback(err);
        callback(null, results.affectedRows);
    });
};

// DELETE - Menghapus data pelanggan
exports.deleteDataPelanggan = (id, callback) => {
    const query = 'DELETE FROM Data_Pelanggan WHERE IDPEL = ?';
    db.query(query, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results.affectedRows);
    });
};
