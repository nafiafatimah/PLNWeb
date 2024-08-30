const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dataPelangganModel = require('../models/dataPelangganModel');

// Validasi input
const validateDataPelanggan = [
    check('IDPEL').notEmpty().withMessage('IDPEL is required'),
    check('Nama_Pelanggan').notEmpty().withMessage('Nama_Pelanggan is required'),
    check('Email').isEmail().withMessage('Invalid Email format')
];

// CREATE - Menangani POST request
router.post('/', validateDataPelanggan, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    dataPelangganModel.createDataPelanggan(req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Redirect ke halaman utama setelah sukses create
        res.redirect('/data-pelanggan');
    });
});

// READ (all) - Menangani GET request untuk menampilkan semua data
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

// UPDATE - Menangani PUT request untuk update data pelanggan
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


// DELETE - Menangani DELETE request untuk menghapus data
router.delete('/:id', (req, res) => {
    dataPelangganModel.deleteDataPelanggan(req.params.id, (err, affectedRows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (affectedRows === 0) return res.status(404).json({ message: 'Data Pelanggan not found' });
        res.redirect('/data-pelanggan');
    });
});

module.exports = router;
