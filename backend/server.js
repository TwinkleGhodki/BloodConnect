const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/donors',    require('./routes/donors'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/hospitals', require('./routes/hospitals'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'BloodConnect API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));