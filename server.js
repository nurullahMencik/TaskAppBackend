const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const errorHandler = require('./middlewares/errorHandler'); // Hata yakalayıcı 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes'); 
const logRoutes = require('./routes/logRoutes'); 
const {connectDB} = require("./config/db")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'ler
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://konyaereglisatis.com','https://konyaereglisatis.com'],
  credentials: true
}));

// Veritabanı Bağlantısı

connectDB();

// Rota tanımlamaları

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes); 
app.use('/api/projects', projectRoutes); 
app.use('/api/tasks', taskRoutes); //  

app.get('/', (req, res) => {
    res.send("IP çalışıyor...");
});

// Hata yakalayıcı middleware
app.use(errorHandler);

// Sunucuyu dinlemeye başla
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor!!!`);
});
