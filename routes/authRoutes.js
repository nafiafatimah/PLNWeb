const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const User = require('../models/UsersModel'); // Model for User management
const router = express.Router();

// GET: Render Register Page
router.get('/register', (req, res) => {
    res.render('auth/register', { errors: [], success_msg: '' });
});

// POST: Handle Registration
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
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/auth/register');
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(username, email, hashedPassword); // Use User model to create

        req.flash('success_msg', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error occurred during registration');
        res.redirect('/auth/register');
    }
});

// GET: Render Login Page
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/data-pelanggan'); // Redirect if already logged in
    }
    res.render('auth/login', { errors: [], success_msg: req.flash('success_msg') });
});

// POST: Handle Login Process
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
        // Check if user exists
        const user = await User.findByEmail(email);
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Check password validity
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Save user session
        req.session.userId = user.id;
        req.flash('success_msg', 'Login successful! Welcome back.');
        return res.redirect('/data-pelanggan'); // Redirect to data pelanggan page
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred');
        return res.redirect('/auth/login');
    }
});

// GET: Handle Logout Process
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.flash('error_msg', 'Error occurred during logout');
            return res.redirect('/data-pelanggan');
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/auth/login');
    });
});

// GET: Render Profile Page (if required)
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        req.flash('error_msg', 'Please log in to view your profile');
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findById(req.session.userId);
        res.render('auth/profile', { user });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred while fetching profile');
        res.redirect('/data-pelanggan');
    }
});

module.exports = router;
