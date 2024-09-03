const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const dataPelangganRoutes = require('./routes/dataPelangganRoutes');

// Middleware untuk menangani form data dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk method override agar bisa menangani DELETE dan PUT
app.use(methodOverride('_method'));

// Menggunakan EJS sebagai view engine
app.set('view engine', 'ejs');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Tempat penyimpanan file yang diupload
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Nama file
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Menggunakan routes untuk /data-pelanggan
app.use('/data-pelanggan', dataPelangganRoutes);

// Jalankan server pada port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
