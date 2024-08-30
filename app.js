const express = require('express');
const methodOverride = require('method-override');
const app = express();
const dataPelangganRoutes = require('./routes/dataPelangganRoutes');

// Middleware untuk menangani form data dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk method override agar bisa menangani DELETE dan PUT
app.use(methodOverride('_method'));

// Menggunakan EJS sebagai view engine
app.set('view engine', 'ejs');

// Menggunakan routes untuk /data-pelanggan
app.use('/data-pelanggan', dataPelangganRoutes);

// Jalankan server pada port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
