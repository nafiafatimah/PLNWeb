const dataPelangganModel = require('../models/dataPelangganModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const transporter = require('../config/mailer'); // Import the transporter for sending emails

// Render halaman data pelanggan
exports.renderDataPelanggan = async (req, res) => {
    const q = req.query.q || ''; // Ambil query pencarian dari URL
    let data;

    try {
        if (q) {
            data = await dataPelangganModel.searchDataPelanggan(q);
        } else {
            data = await dataPelangganModel.getAllDataPelanggan();
        }
        res.render('dataPelanggan/index', { data, q }); // Kirim data dan q ke template
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data pelanggan.');
    }
};

// Menambahkan data pelanggan
exports.addDataPelanggan = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const idpelExist = await dataPelangganModel.isIDPELExist(req.body.IDPEL);
        if (idpelExist) {
            return res.status(400).json({ message: 'IDPEL already exists' });
        }

        const insertId = await dataPelangganModel.createDataPelanggan(req.body);
        res.redirect('/data-pelanggan'); // Redirect setelah berhasil
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Mendapatkan semua data pelanggan
exports.getAllDataPelanggan = async (req, res) => {
    try {
        const results = await dataPelangganModel.getAllDataPelanggan();
        res.render('dataPelanggan/index', { data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Mendapatkan data pelanggan berdasarkan IDPEL
exports.getDataPelangganById = async (req, res) => {
    try {
        const result = await dataPelangganModel.getDataPelangganById(req.params.id);
        res.render('dataPelanggan/edit', { data: result });
    } catch (err) {
        console.error(err);
        res.status(err.message === 'Data not found' ? 404 : 500).json({ error: err.message });
    }
};

// Mengupdate data pelanggan berdasarkan IDPEL
exports.updateDataPelanggan = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const affectedRows = await dataPelangganModel.updateDataPelanggan(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Menghapus data pelanggan berdasarkan IDPEL
exports.deleteDataPelanggan = async (req, res) => {
    try {
        const affectedRows = await dataPelangganModel.deleteDataPelanggan(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Menampilkan form upload
exports.renderUploadForm = async (req, res) => {
    try {
        const result = await dataPelangganModel.getDataPelangganById(req.params.id);
        res.render('dataPelanggan/upload', { data: result }); // Render upload view with customer data
    } catch (err) {
        console.error(err);
        return res.status(err.message === 'Data not found' ? 404 : 500).json({ error: err.message });
    }
};

// Upload file dan kirim email
exports.uploadFilesAndSendEmail = async (req, res) => {
    const { files } = req; // Assuming 'files' is populated by multer or similar middleware
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
        const customer = await dataPelangganModel.getDataPelangganById(req.params.id);
        const email = customer.Email;

        const attachments = files.map(file => ({
            path: path.join(__dirname, '../uploads', file.filename)
        }));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Invoice Tagihan Listrik',
            text: 'Dear all...\n\nBerikut kami sampaikan Invoice Pelanggan bulan ini dengan data terlampir. Mohon dapat disampaikan paling lambat tanggal 20 setiap bulannya, sebelum timbul BK (Biaya Keterlambatan) + sanksi pemutusan di tanggal 21.\n\nDemikian disampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih. \n\nBest Regards, \n\nBagian Pemasaran & Pelayanan Pelanggan\nPT PLN (Persero) UP3 Gresik',
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Files uploaded and email sent successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send email', error });
    }
};

// Fungsi untuk mencari data pelanggan berdasarkan nama
exports.searchDataPelanggan = async (req, res) => {
    const query = req.query.q; // Mengambil parameter pencarian dari query string

    try {
        const results = await dataPelangganModel.searchDataPelanggan(query);
        res.render('dataPelanggan/index', { data: results, q: query });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};
