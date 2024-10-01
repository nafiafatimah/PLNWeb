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
router.post('/', validateDataPelanggan, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const insertId = await dataPelangganModel.createDataPelanggan(req.body);
        res.redirect('/data-pelanggan');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ (all)
router.get('/', async (req, res) => {
    try {
        const results = await dataPelangganModel.getAllDataPelanggan();
        res.render('dataPelanggan/index', { data: results });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ (by ID) - Menampilkan form edit
router.get('/:id/edit', async (req, res) => {
    try {
        const result = await dataPelangganModel.getDataPelangganById(req.params.id);
        res.render('dataPelanggan/edit', { data: result });
    } catch (err) {
        return res.status(err.message === 'Data not found' ? 404 : 500).json({ error: err.message });
    }
});

// READ (by ID) - Menampilkan form upload
router.get('/:id/upload', async (req, res) => {
    try {
        const result = await dataPelangganModel.getDataPelangganById(req.params.id);
        res.render('dataPelanggan/upload', { data: result });
    } catch (err) {
        return res.status(err.message === 'Data not found' ? 404 : 500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', validateDataPelanggan, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const affectedRows = await dataPelangganModel.updateDataPelanggan(req.params.id, req.body);
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await dataPelangganModel.deleteDataPelanggan(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// HANDLE FILE UPLOAD AND EMAIL
router.post('/:id/upload', upload.single('file'), async (req, res) => {
    const { file, body } = req;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const emails = body.Email.split(',').map(email => email.trim());
    const filePath = path.join(__dirname, '../uploads', file.filename);

    // Konfigurasi email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: 'Invoice Tagihan Listrik',
        text: 'Dear all...\n\nBerikut kami sampaikan Invoice Pelanggan bulan ini dengan data terlampir. Mohon dapat di sampaikan paling lambat tanggal 20 setiap bulannya, sebelum timbul BK (Biaya Keterlambatan) + sanksi pemutusan di tanggal 21.\n\nDemikian disampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih. \n\nBest Regards, \n\nBagian Pemasaran & Pelayanan Pelanggan\nPT PLN (Persero) UP3 Gresik',
        attachments: [
            {
                path: filePath
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'File uploaded and email sent successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to send email', error });
    }
});

module.exports = router; // Mengekspor router
