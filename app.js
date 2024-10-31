const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Konfigurasi session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

// Middleware flash message
app.use(flash());

// Middleware untuk menangani form data dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk method override agar bisa menangani DELETE dan PUT
app.use(methodOverride('_method'));

// Menggunakan EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Menyajikan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk set flash message ke view
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Route untuk halaman utama
app.get('/', (req, res) => {
    res.render('index', {
        success_msg: req.flash('success_msg'), // Pass success message
        error_msg: req.flash('error_msg')      // Pass error message
    });
});

// Import routes
const authRoutes = require('./routes/authRoutes'); 
const dataPelangganRoutes = require('./routes/dataPelangganRoutes');
const dataPelangganController = require('./controllers/dataPelanggan');
// Gunakan rute
app.use('/auth', authRoutes); // Auth route
app.use('/data-pelanggan', dataPelangganRoutes); 
app.get('/data-pelanggan', dataPelangganController.renderDataPelanggan);
// Jalankan server pada port 3000
const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
