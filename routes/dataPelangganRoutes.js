const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dataPelangganModel = require('../models/dataPelangganModel');
const multer = require('multer');
const path = require('path');
const transporter = require('../config/mailer'); // Import transporter

// Konfigurasi multer untuk upload file
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // Maksimal 10MB
});

// Validasi input
const validateDataPelanggan = [
    check('IDPEL').notEmpty().withMessage('IDPEL is required'),
    check('Nama_Pelanggan').notEmpty().withMessage('Nama Pelanggan is required'),
    check('Email').custom(value => {
        const emails = value.split(',').map(email => email.trim());
        for (let email of emails) {
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                throw new Error('Invalid Email format');
            }
        }
        return true;
    }).withMessage('Invalid Email format')
];


// CREATE
router.post('/', validateDataPelanggan, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    dataPelangganModel.createDataPelanggan(req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.redirect('/data-pelanggan');
    });
});

// READ (all)
router.get('/', (req, res) => {
    dataPelangganModel.getAllDataPelanggan((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.render('dataPelanggan/index', { data: results });
    });
});

// READ (by ID) - Menampilkan form edit
router.get('/:id/edit', (req, res) => {
    dataPelangganModel.getDataPelangganById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.render('dataPelanggan/edit', { data: result });
    });
});

// READ (by ID) - Menampilkan form upload
router.get('/:id/upload', (req, res) => {
    dataPelangganModel.getDataPelangganById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.render('dataPelanggan/upload', { data: result });
    });
});

// UPDATE
router.put('/:id', validateDataPelanggan, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    dataPelangganModel.updateDataPelanggan(req.params.id, req.body, (err, affectedRows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    });
});

// DELETE
router.delete('/:id', (req, res) => {
    dataPelangganModel.deleteDataPelanggan(req.params.id, (err, affectedRows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    });
});

// HANDLE FILE UPLOAD AND EMAIL
router.post('/:id/upload', upload.single('file'), (req, res) => {
    const { file, body } = req;
    const emails = body.Email.split(',').map(email => email.trim());
    const filePath = path.join(__dirname, '../uploads', file.filename);

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Konfigurasi email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'Invoice Tagihan Listrik',
        text: 'Dear all...\n\nBerikut kami sampaikan invoice pelanggan bulan ini dengan data terlampir. Mohon dapat di sampaikan paling lambat tanggal 20 setiap bulannya, sebelum timbul BK (Biaya Keterlambatan) + sanksi pemutusan di tanggal 21.\n\n\ Demikian disampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih. \n\n Best Regards, \n\n Bagian Pemasaran & Pelayanan Pelanggan\n PT PLN (Persero) UP3 Gresik',
        attachments: [
            {
                path: filePath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to send email', error });
        }
        res.status(200).json({ message: 'File uploaded and email sent successfully' });
    });
});

module.exports = router;
