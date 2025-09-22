const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
// Middleware to check admin role
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    user: req.user,
    currentPage: 'error',
    message: 'Access denied. Admin privileges required.'
  });
}

// Function to create hardcoded admin accounts
async function createAdminAccounts() {
  try {
    // Admin Account 1
    const admin1Exists = await User.findOne({ email: 'admin1@sellit.com' });
    if (!admin1Exists) {
      await User.create({
        name: 'Admin One',
        email: 'admin1@sellit.com',
        faculty: 'Administration',
        whatsapp: '+2341234567890',
        password: 'admin123', // In production, use a strong password
        role: 'admin'
      });
      console.log('Admin account 1 created: admin1@sellit.com');
    }

    // Admin Account 2
    const admin2Exists = await User.findOne({ email: 'admin2@sellit.com' });
    if (!admin2Exists) {
      await User.create({
        name: 'Admin Two',
        email: 'admin2@sellit.com',
        faculty: 'Administration',
        whatsapp: '+2341234567891',
        password: 'admin123', // In production, use a strong password
        role: 'admin'
      });
      console.log('Admin account 2 created: admin2@sellit.com');
    }
  } catch (err) {
    console.log('Error creating admin accounts:', err);
  }
}

// Import models and routes
const User = require('../models/User');
const Product = require('../models/Product');
const SellerApplication = require('../models/SellerApplication');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return done(null, false, { message: 'Invalid password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    user: req.user,
    currentPage: 'home'
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    user: req.user,
    currentPage: 'about'
  });
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.render('products', {
      user: req.user,
      currentPage: 'products',
      products
    });
  } catch (err) {
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Error loading products'
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', {
    user: req.user,
    currentPage: 'login'
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', (req, res) => {
  res.render('register', {
    user: req.user,
    currentPage: 'register'
  });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, faculty, whatsapp, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', {
        user: req.user,
        currentPage: 'register',
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      faculty,
      whatsapp,
      password: hashedPassword
    });

    res.redirect('/login');
  } catch (err) {
    res.render('register', {
      user: req.user,
      currentPage: 'register',
      error: 'Registration failed'
    });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  res.render('dashboard', {
    user: req.user,
    currentPage: 'dashboard'
  });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Admin routes
app.get('/admin', ensureAdmin, async (req, res) => {
  try {
    const applications = await SellerApplication.findAll();
    const products = await Product.findAll();
    const users = await User.findAll();

    res.render('admin', {
      user: req.user,
      currentPage: 'admin',
      applications,
      products,
      users
    });
  } catch (err) {
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Error loading admin dashboard'
    });
  }
});

// Initialize admin accounts
createAdminAccounts();

module.exports = app;
module.exports.handler = serverless(app);