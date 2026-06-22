// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const { initializeApp, cert } = require('firebase-admin/app');
// const connectDB = require('./config/db');

// // Initialize Firebase Admin
// initializeApp({
//   credential: cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   }),
// });

// const app = express();
// connectDB();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/clients', require('./routes/clients'));
// app.use('/api/invoices', require('./routes/invoices'));
// app.use('/api/payments', require('./routes/payments'));

// app.get('/', (req, res) => res.send('Freelancer Backend Running ✅'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));


// Only use dotenv locally, Railway has its own env system
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const connectDB = require('./config/db');

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => res.send('Freelancer Backend Running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

module.exports = app;