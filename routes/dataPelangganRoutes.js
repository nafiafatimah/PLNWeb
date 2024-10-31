const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const dataPelangganController = require('../controllers/dataPelanggan');
const multer = require('multer');

// Konfigurasi multer untuk upload file
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Validasi input pelanggan
const validateDataPelanggan = [
    check('IDPEL').notEmpty().withMessage('IDPEL is required'),
    check('Nama_Pelanggan').notEmpty().withMessage('Nama Pelanggan is required'),
    check('Email').custom(value => {
        const emails = value.split(',').map(email => email.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let email of emails) {
            if (!emailRegex.test(email)) {
                throw new Error(`Invalid Email format: ${email}`);
            }
        }
        return true;
    }).withMessage('Invalid Email format')
];

// Routes
router.get('/', dataPelangganController.renderDataPelanggan); // Display all customers
router.post('/', validateDataPelanggan, dataPelangganController.addDataPelanggan); // Add new customer

// Get customer by ID for editing
router.get('/:id/edit', dataPelangganController.getDataPelangganById); // Render edit form
router.put('/:id', validateDataPelanggan, dataPelangganController.updateDataPelanggan); // Update customer

// Delete customer
router.delete('/:id', dataPelangganController.deleteDataPelanggan); // Delete customer

// Display upload form
router.get('/:id/upload', dataPelangganController.renderUploadForm); // Render upload form
router.post('/:id/upload', upload.array('files', 10), dataPelangganController.uploadFilesAndSendEmail); // Handle file upload

// Search functionality
router.get('/search', dataPelangganController.searchDataPelanggan); // Search customers

module.exports = router;
