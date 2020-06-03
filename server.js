const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// LOAD env vars
dotenv.config({ path: './config/config.env' });


// Route files
const authRoute = require('./routes/auth');
const photoRoute = require('./routes/photos');

const app = express();

// Body parser   (da mozemo vidit iz req.body)
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//File upload
app.use(fileupload());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Route middleware
app.use('/api/user',authRoute)
app.use('/api/photos',photoRoute)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in mode on port ${process.env.PORT}`
  )
);

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message} `);
  // Close server & exit process
  server.close(() => process.exit(1));
});


// NODE_ENV=production node server