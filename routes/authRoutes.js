// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const User = require('../models/UsersModel'); // Mengimpor model User
const router = express.Router();

// GET: Halaman Register
router.get('/register', (req, res) => {
    res.render('auth/register', { errors: [], success_msg: '' });
});

// POST: Proses Register
router.post('/register', [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('auth/register', { errors: errors.array(), success_msg: '' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(username, email, hashedPassword); // Memanggil metode create

        req.flash('success_msg', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error occurred during registration');
        res.redirect('/auth/register');
    }
});

// GET: Halaman Login
router.get('/login', (req, res) => {
    res.render('auth/login', { errors: [], success_msg: req.flash('success_msg') });
});

// POST: Proses Login
router.post('/login', [
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').not().isEmpty().withMessage('Password is required'),
], async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('auth/login', { errors: errors.array(), success_msg: '' });
    }

    try {
        const user = await User.findByEmail(email); // Memanggil metode findByEmail

        if (!user) {
            req.flash('error_msg', 'Email atau password tidak valid');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.id;
            req.flash('success_msg', 'Login successful! Welcome back.');
            return res.redirect('/data-pelanggan'); // Redirect ke halaman utama
        } else {
            req.flash('error_msg', 'Email atau password tidak valid');
            return res.redirect('/auth/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred');
        return res.redirect('/auth/login');
    }
});

// GET: Proses Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error_msg', 'Error occurred during logout');
            return res.redirect('/');
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/auth/login');
    });
});

module.exports = router;
