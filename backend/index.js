// Imports
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


// Create express app
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/file', require('./routes/file.routes'));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB')
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((error) => console.error('Error connecting to MongoDB:', error));


