require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const {connectDB} = require('./config')

const app = express()

connectDB()

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allow specified HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
const urlRoutes = require('./routes/url.route');
const authRoutes = require('./routes/auth.route');
app.use('/', urlRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        message: "Welcome to dydx link shortner"
    })
})

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
