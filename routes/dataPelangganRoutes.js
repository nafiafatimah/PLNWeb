const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dataPelangganModel = require('../models/dataPelangganModel');
const multer = require('multer');
const path = require('path');
const transporter = require('../config/mailer'); // Import transporter

// Konfigurasi multer untuk upload file
const upload = multer({
    dest: 'uploads/', // Tempat penyimpanan file sementara
    limits: { fileSize: 10 * 1024 * 1024 } // Maksimal 10MB per file
});

// Validasi input pelanggan
const validateDataPelanggan = [
    check('IDPEL').notEmpty().withMessage('IDPEL is required'),
    check('Nama_Pelanggan').notEmpty().withMessage('Nama Pelanggan is required'),
    check('Email').custom(value => {
        // Pisahkan email dan hilangkan spasi tambahan
        const emails = value.split(',').map(email => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex untuk validasi email

        // Cek setiap email
        for (let email of emails) {
            if (!emailRegex.test(email)) {
                throw new Error(`Invalid Email format: ${email}`);
            }
        }
        return true; // Semua email valid
    }).withMessage('Invalid Email format')
];

// CREATE - Menambahkan data pelanggan baru
router.post('/', validateDataPelanggan, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Cek apakah IDPEL sudah ada di database
        const idpelExist = await dataPelangganModel.isIDPELExist(req.body.IDPEL);
        if (idpelExist) {
            return res.status(400).json({ message: 'IDPEL already exists' });
        }

        // Jika IDPEL belum ada, lanjutkan dengan menambahkan data
        const insertId = await dataPelangganModel.createDataPelanggan(req.body);
        res.redirect('/data-pelanggan');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ (all) - Mendapatkan semua data pelanggan
router.get('/', async (req, res) => {
    try {
        const results = await dataPelangganModel.getAllDataPelanggan();
        res.render('dataPelanggan/index', { data: results });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ (by ID) - Mendapatkan data pelanggan berdasarkan IDPEL
router.get('/:id/edit', async (req, res) => {
    try {
        const result = await dataPelangganModel.getDataPelangganById(req.params.id);
        res.render('dataPelanggan/edit', { data: result });
    } catch (err) {
        return res.status(err.message === 'Data not found' ? 404 : 500).json({ error: err.message });
    }
});

// UPDATE - Mengupdate data pelanggan berdasarkan IDPEL
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

// DELETE - Menghapus data pelanggan berdasarkan IDPEL
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await dataPelangganModel.deleteDataPelanggan(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// HANDLE MULTIPLE FILE UPLOAD AND EMAIL
router.post('/:id/upload', upload.array('files', 10), async (req, res) => {
    const { files } = req;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
        // Fetch customer data by ID to get the email
        const customer = await dataPelangganModel.getDataPelangganById(req.params.id);
        const email = customer.Email; // Get email from the customer data
        
        // Use the email retrieved from the database
        const attachments = files.map(file => ({
            path: path.join(__dirname, '../uploads', file.filename)
        }));

        // Konfigurasi email dengan beberapa file yang di-attach
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Send to the email retrieved
            subject: 'Invoice Tagihan Listrik',
            text: 'Dear all...\n\nBerikut kami sampaikan Invoice Pelanggan bulan ini dengan data terlampir. Mohon dapat disampaikan paling lambat tanggal 20 setiap bulannya, sebelum timbul BK (Biaya Keterlambatan) + sanksi pemutusan di tanggal 21.\n\nDemikian disampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih. \n\nBest Regards, \n\nBagian Pemasaran & Pelayanan Pelanggan\nPT PLN (Persero) UP3 Gresik',
            attachments: attachments // Array of attachments
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Files uploaded and email sent successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to send email', error });
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

router.get('/', async (req, res) => {
    try {
        const results = await dataPelangganModel.getAllDataPelanggan();
        
        // Assuming user information is stored in the session
        const user = req.session.userId ? await User.findById(req.session.userId) : null;

        res.render('dataPelanggan/index', { data: results, user }); // Pass user object
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router; // Mengekspor router
