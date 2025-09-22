const express = require('express');
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

// Routes= require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Ad = require('./models/Ad');
const Report = require('./models/Report');
const Post = require('./models/Post');
const SellerApplication = require('./models/SellerApplication');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com', // Replace with your Gmail address
    pass: process.env.EMAIL_PASS || 'your-app-password' // Replace with your Gmail App Password
  }
});

// Function to send password reset email
async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com',
    to: user.email,
    subject: 'Password Reset - Snap Cart Marketplace',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #212529;">Reset Your Password</h2>
        <p>You requested a password reset for your Snap Cart account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #212529; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The Sellit Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

// Function to send email verification
async function sendEmailVerification(user, verificationToken) {
  const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com',
    to: user.email,
    subject: 'Verify Your Email - Snap Cart Marketplace',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #212529;">Welcome to Snap Cart Marketplace!</h2>
        <p>Thank you for registering with Snap Cart. Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Snap Cart Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email verification sent to:', user.email);
  } catch (error) {
    console.error('Error sending email verification:', error);
  }
}

// Function to send seller application approval email
async function sendSellerApprovalEmail(user, application) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com',
    to: user.email,
    subject: 'Congratulations! Your Seller Application Has Been Approved - Snap Cart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Congratulations, ${user.name}!</h2>
        <p>Your seller application for <strong>${application.university.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> has been approved!</p>
        <p>You can now start selling products on Snap Cart. Here's what you can do next:</p>
        <ul style="line-height: 1.6;">
          <li>Visit your <a href="http://localhost:3000/dashboard" style="color: #007bff;">dashboard</a> to see your seller status</li>
          <li><a href="http://localhost:3000/sell" style="color: #007bff;">List your first product</a> to start selling</li>
          <li>Check out our <a href="http://localhost:3000/${application.university.toLowerCase().replace(/\s+/g, '-')}" style="color: #007bff;">university page</a> to see other sellers from your school</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/sell" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Selling Now</a>
        </div>
        <p>Welcome to the Snap Cart seller community!</p>
        <p>Best regards,<br>The Snap Cart Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Seller approval email sent to:', user.email);
  } catch (error) {
    console.error('Error sending seller approval email:', error);
  }
}

// Function to send seller application rejection email
async function sendSellerRejectionEmail(user, application, notes) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com',
    to: user.email,
    subject: 'Update on Your Seller Application - Snap Cart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Seller Application Update</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your interest in becoming a seller on Snap Cart. After careful review, we regret to inform you that your application for <strong>${application.university.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> has not been approved at this time.</p>
        ${notes ? `<p><strong>Review Notes:</strong> ${notes}</p>` : ''}
        <p>You can reapply at any time by visiting your dashboard and submitting a new application.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/dashboard" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
        </div>
        <p>We appreciate your understanding and hope to see you apply again in the future.</p>
        <p>Best regards,<br>The Snap Cart Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Seller rejection email sent to:', user.email);
  } catch (error) {
    console.error('Error sending seller rejection email:', error);
  }
}

// Function to send seller unapproval email
async function sendSellerUnapprovalEmail(user, application, notes) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-actual-gmail@gmail.com',
    to: user.email,
    subject: 'Seller Status Update - Snap Cart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #856404;">Seller Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>Your seller privileges on Snap Cart have been revoked by our admin team.</p>
        <p>Your account has been changed back to a buyer account. You will no longer be able to list products for sale.</p>
        ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
        <p>If you believe this was done in error or would like to reapply, please contact our support team.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000/dashboard" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
        </div>
        <p>We appreciate your understanding.</p>
        <p>Best regards,<br>The Snap Cart Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Seller unapproval email sent to:', user.email);
  } catch (error) {
    console.error('Error sending seller unapproval email:', error);
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'sellit-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) return done(null, false, { message: 'Incorrect email.' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      // Check if email is verified
      if (!user.emailVerified) {
        return done(null, false, { message: 'Please verify your email before logging in.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

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

// Routes
app.get('/', async (req, res) => {
  const carouselAds = await Ad.getCarouselAds();
  const popupAds = await Ad.getPopupAds();
  
  // Get verified users
  const verifiedUsers = await User.find({ verified: true });
  const verifiedUserIds = verifiedUsers.map(user => user._id);
  
  // Get products from verified users only, limited to 2 per user
  let featuredProducts = [];
  for (const userId of verifiedUserIds) {
    const userProducts = await Product.find({ seller: userId });
    // Take only first 2 products from each verified user
    featuredProducts = featuredProducts.concat(userProducts.slice(0, 2));
  }
  
  // Populate seller information for each product
  const populatedProducts = await Promise.all(
    featuredProducts.map(async (product) => {
      const seller = await User.findById(product.seller);
      return {
        ...product,
        seller: seller ? {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          whatsapp: seller.whatsapp,
          verified: seller.verified
        } : null
      };
    })
  );
  
  // Shuffle the products for variety
  const shuffledProducts = populatedProducts.sort(() => Math.random() - 0.5);

  // Get approved sellers grouped by university
  const SellerApplication = require('./models/SellerApplication');
  const approvedApplications = await SellerApplication.getApprovedApplications();
  const universitySellers = {};

  for (const application of approvedApplications) {
    const seller = await User.findById(application.userId);
    if (seller && seller.sellerApproved) {
      const university = application.university;
      if (!universitySellers[university]) {
        universitySellers[university] = [];
      }
      universitySellers[university].push({
        _id: seller._id,
        name: seller.name,
        profileImage: seller.profileImage,
        university: university
      });
    }
  }

  // Convert to array format for easier template rendering
  const universities = Object.keys(universitySellers).map(university => ({
    name: university,
    displayName: university.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    sellers: universitySellers[university]
  }));
  
  res.render('index', { 
    user: req.user, 
    carouselAds, 
    popupAds, 
    featuredProducts: shuffledProducts, 
    universities,
    currentPage: 'home' 
  });
});

app.get('/about', (req, res) => {
  res.render('about', { user: req.user, currentPage: 'about' });
});

app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { user: req.user, currentPage: 'privacy-policy' });
});

app.get('/terms', (req, res) => {
  res.render('terms', { user: req.user, currentPage: 'terms' });
});

app.get('/login', (req, res) => {
  const success = req.query.message;
  res.render('login', { user: req.user, currentPage: 'login', success });
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('login', {
        user: null,
        currentPage: 'login',
        error: info.message || 'Invalid email or password'
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Redirect based on user role
      if (req.user.role === 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/dashboard');
      }
    });
  })(req, res, next);
});

app.get('/register', (req, res) => {
  res.render('register', { user: req.user, currentPage: 'register' });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, whatsapp, password, confirmPassword } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.render('register', {
        user: null,
        currentPage: 'register',
        error: 'Please enter a valid email address'
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', {
        user: null,
        currentPage: 'register',
        error: 'Passwords do not match'
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render('register', {
        user: null,
        currentPage: 'register',
        error: 'Email already registered'
      });
    }

    // Create basic user account
    const user = await User.create({
      name,
      email,
      whatsapp,
      password,
      role: 'buyer', // Start as buyer, can apply to become seller later
      emailVerified: false,
      emailVerificationToken: require('crypto').randomBytes(32).toString('hex'),
      emailVerificationExpires: Date.now() + 86400000, // 24 hours
      sellerApproved: false
    });

    // Send email verification
    await sendEmailVerification(user, user.emailVerificationToken);

    res.render('register', {
      user: null,
      currentPage: 'register',
      success: 'Registration successful! Please check your email and click the verification link to activate your account. You can apply to become a seller from your dashboard after logging in.'
    });
  } catch (err) {
    console.log(err);
    res.render('register', {
      user: null,
      currentPage: 'register',
      error: 'Registration failed. Please try again.'
    });
  }
});

app.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('error', {
        user: req.user,
        currentPage: 'error',
        message: 'Email verification token is invalid or has expired'
      });
    }

    // Update user as verified and clear verification token
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    res.render('email-verified', {
      user: req.user,
      currentPage: 'email-verified'
    });
  } catch (err) {
    console.log('Email verification error:', err);
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'An error occurred during email verification'
    });
  }
});

app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { user: req.user, currentPage: 'forgot-password' });
});

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.render('forgot-password', {
        user: req.user,
        currentPage: 'forgot-password',
        error: 'Please enter a valid email address'
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render('forgot-password', {
        user: req.user,
        currentPage: 'forgot-password',
        error: 'No account found with that email address'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.render('forgot-password', {
        user: req.user,
        currentPage: 'forgot-password',
        error: 'Please verify your email before resetting your password.'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Update user with reset token
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.render('forgot-password', {
      user: req.user,
      currentPage: 'forgot-password',
      success: 'Password reset link sent to your email'
    });
  } catch (err) {
    console.log('Forgot password error:', err);
    res.render('forgot-password', {
      user: req.user,
      currentPage: 'forgot-password',
      error: 'An error occurred. Please try again.'
    });
  }
});

app.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('error', {
        user: req.user,
        currentPage: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

    res.render('reset-password', {
      user: req.user,
      currentPage: 'reset-password',
      token: token
    });
  } catch (err) {
    console.log('Reset password GET error:', err);
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'An error occurred'
    });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('reset-password', {
        user: req.user,
        currentPage: 'reset-password',
        token: token,
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.render('reset-password', {
        user: req.user,
        currentPage: 'reset-password',
        token: token,
        error: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('error', {
        user: req.user,
        currentPage: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    res.redirect('/login?message=Password reset successful. Please login with your new password.');
  } catch (err) {
    console.log('Reset password POST error:', err);
    res.render('reset-password', {
      user: req.user,
      currentPage: 'reset-password',
      token: token,
      error: 'An error occurred. Please try again.'
    });
  }
});

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
  const products = await Product.findBySeller(req.user._id);

  // Check seller application status
  let sellerStatus = 'none';
  try {
    const application = await SellerApplication.getByUserId(req.user._id);
    if (application) {
      sellerStatus = application.status;
    }
  } catch (error) {
    console.error('Error checking seller status:', error);
  }

  // Add seller status to user object for template
  const userWithStatus = { ...req.user, sellerStatus };

  res.render('dashboard', { user: userWithStatus, products, currentPage: 'dashboard' });
});

// Seller Application Routes
app.get('/apply-seller', ensureAuthenticated, async (req, res) => {
  try {
    // Check if user already has an application
    const existingApplication = await SellerApplication.getByUserId(req.user._id);

    if (existingApplication) {
      if (existingApplication.status === 'approved') {
        return res.redirect('/dashboard?message=You are already an approved seller');
      } else if (existingApplication.status === 'pending') {
        return res.render('seller-application', {
          user: req.user,
          currentPage: 'apply-seller',
          error: 'You already have a pending application. Please wait for admin review.'
        });
      } else if (existingApplication.status === 'rejected') {
        // Allow re-application if previously rejected
        return res.render('seller-application', {
          user: req.user,
          currentPage: 'apply-seller',
          existingApplication: existingApplication
        });
      }
    }

    res.render('seller-application', {
      user: req.user,
      currentPage: 'apply-seller'
    });
  } catch (error) {
    console.error('Error loading seller application:', error);
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Failed to load seller application form'
    });
  }
});

app.post('/apply-seller', ensureAuthenticated, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      university,
      shopName,
      businessDescription,
      experience,
      productCategories,
      acceptTerms
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !university || !shopName || !businessDescription || !acceptTerms) {
      return res.render('seller-application', {
        user: req.user,
        currentPage: 'apply-seller',
        error: 'Please fill in all required fields and accept the terms.'
      });
    }

    // Check if user already has a pending application
    const existingApplication = await SellerApplication.getByUserId(req.user._id);
    if (existingApplication && existingApplication.status === 'pending') {
      return res.render('seller-application', {
        user: req.user,
        currentPage: 'apply-seller',
        error: 'You already have a pending application.'
      });
    }

    // Create new application
    const application = await SellerApplication.create({
      userId: req.user._id,
      personalInfo: {
        fullName,
        email,
        phone
      },
      university,
      businessInfo: {
        shopName,
        businessDescription,
        experience: experience || 'none',
        productCategories: productCategories || ''
      },
      status: 'pending',
      appliedAt: new Date().toISOString(),
      termsAccepted: true
    });

    res.render('seller-application', {
      user: req.user,
      currentPage: 'apply-seller',
      success: 'Your seller application has been submitted successfully! Our team will review it within 24-48 hours. You will receive an email notification once a decision is made.'
    });
  } catch (error) {
    console.error('Error submitting seller application:', error);
    res.render('seller-application', {
      user: req.user,
      currentPage: 'apply-seller',
      error: 'Failed to submit application. Please try again.'
    });
  }
});

app.get('/products', async (req, res) => {
  const products = await Product.findWithSeller();
  res.render('products', { products, user: req.user, currentPage: 'products' });
});

app.get('/sell', ensureAuthenticated, (req, res) => {
  res.render('sell', { 
    user: req.user, 
    currentPage: 'sell',
    isApprovedSeller: req.user.sellerApproved || false
  });
});

app.post('/sell', ensureAuthenticated, upload.array('images', 5), async (req, res) => {
  // Check if user is blocked
  if (req.user.blocked) {
    return res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Your account is blocked and you cannot post products.'
    });
  }

  // Check if user is an approved seller
  if (!req.user.sellerApproved) {
    return res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'You must be an approved seller to post products. Please apply to become a seller first.'
    });
  }

  const { title, description, price, category, whatsappMessage } = req.body;
  
  // Handle multiple images
  const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];

  const product = await Product.create({
    title,
    description,
    price: `₦${price}`,
    category,
    images, // Store array of images
    image: images.length > 0 ? images[0] : '', // Keep backward compatibility
    whatsappMessage: whatsappMessage || '', // Store custom message or empty string
    seller: req.user._id
  });

  io.emit('newProduct', { product, seller: req.user });
  res.redirect('/dashboard');
});

app.delete('/product/:id', ensureAuthenticated, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && product.seller === req.user._id) {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Not authorized' });
  }
});

app.get('/edit-product/:id', ensureAuthenticated, async (req, res) => {
  // Check if user is blocked
  if (req.user.blocked) {
    return res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Your account is blocked and you cannot edit products.'
    });
  }

  const product = await Product.findById(req.params.id);
  if (product && product.seller === req.user._id) {
    res.render('edit-product', { user: req.user, product, currentPage: 'dashboard' });
  } else {
    res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'You can only edit your own products.'
    });
  }
});

app.post('/edit-product/:id', ensureAuthenticated, upload.single('image'), async (req, res) => {
  // Check if user is blocked
  if (req.user.blocked) {
    return res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Your account is blocked and you cannot edit products.'
    });
  }

  const product = await Product.findById(req.params.id);
  if (product && product.seller === req.user._id) {
    const { title, description, price, category, whatsappMessage } = req.body;
    const updateData = {
      title,
      description,
      price: `₦${price}`,
      category,
      whatsappMessage: whatsappMessage || '' // Update custom message
    };

    // Only update image if a new one is uploaded
    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/dashboard');
  } else {
    res.status(403).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'You can only edit your own products.'
    });
  }
});

// Report user route
app.post('/report-user', ensureAuthenticated, async (req, res) => {
  const { reportedUserId, reason } = req.body;

  if (!reportedUserId || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Check if user is trying to report themselves
  if (reportedUserId === req.user._id) {
    return res.status(400).json({ success: false, message: 'You cannot report yourself' });
  }

  // Check if reported user exists
  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Create the report
  const report = await Report.create({
    reporterId: req.user._id,
    reportedUserId: reportedUserId,
    reason: reason,
    reporterName: req.user.name,
    reportedUserName: reportedUser.name,
    reportedUserEmail: reportedUser.email
  });

  res.json({ success: true, report });
});

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Check if user is blocked
    if (req.user.blocked) {
      req.logout((err) => {
        if (err) console.log('Logout error:', err);
        return res.render('error', {
          user: null,
          currentPage: 'error',
          message: 'Your account has been blocked. Please contact support if you believe this is an error.'
        });
      });
      return;
    }
    return next();
  }
  res.redirect('/login');
}

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

// Admin routes
app.get('/admin', ensureAdmin, async (req, res) => {
  const ads = await Ad.find();
  const totalUsers = await User.count();
  const totalProducts = await Product.count();
  const totalAds = ads.length;

  // Get seller application stats
  const SellerApplication = require('./models/SellerApplication');
  const pendingApplications = await SellerApplication.getPendingApplications();
  const totalApplications = await SellerApplication.find();
  const approvedApplications = await SellerApplication.getApprovedApplications();
  const rejectedApplications = await SellerApplication.getRejectedApplications();

  res.render('admin', {
    user: req.user,
    ads,
    totalUsers,
    totalProducts,
    totalAds,
    pendingApplications: pendingApplications.length,
    totalApplications: totalApplications.length,
    approvedApplications: approvedApplications.length,
    rejectedApplications: rejectedApplications.length,
    currentPage: 'admin'
  });
});

app.get('/admin/ad/new', ensureAdmin, (req, res) => {
  res.render('ad-form', { user: req.user, ad: null, isEditing: false, currentPage: 'admin' });
});

app.post('/admin/ad/new', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, link, displayType, priority, displayDelay, duration, frequency, maxDisplays, autoHide, showCloseButton, rotationInterval, autoRotate, active } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';

    if (!title || !description) {
      return res.status(400).render('ad-form', { 
        user: req.user, 
        ad: null, 
        isEditing: false, 
        currentPage: 'admin',
        error: 'Title and description are required.' 
      });
    }

    await Ad.create({
      title,
      description,
      image,
      link,
      displayType: displayType || 'carousel',
      priority: parseInt(priority) || 0,
      displayDelay: parseInt(displayDelay) || (displayType === 'popup' ? 5 : 0),
      duration: parseInt(duration) || (displayType === 'popup' ? 10 : 0),
      frequency: frequency || (displayType === 'popup' ? 'once-per-session' : 'every-visit'),
      maxDisplays: parseInt(maxDisplays) || (displayType === 'popup' ? 3 : 1),
      autoHide: autoHide === 'on',
      showCloseButton: showCloseButton === 'on',
      rotationInterval: parseInt(rotationInterval) || (displayType === 'carousel' ? 5 : 0),
      autoRotate: autoRotate === 'on',
      active: active === 'on'
    });

    res.redirect('/admin');
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).render('ad-form', { 
      user: req.user, 
      ad: null, 
      isEditing: false, 
      currentPage: 'admin',
      error: 'Failed to create ad. Please try again.' 
    });
  }
});

app.get('/admin/ad/:id/edit', ensureAdmin, async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    return res.status(404).render('error', { 
      user: req.user, 
      currentPage: 'error',
      message: 'Ad not found.' 
    });
  }
  res.render('ad-form', { user: req.user, ad, isEditing: true, currentPage: 'admin' });
});

app.post('/admin/ad/:id/edit', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, link, displayType, priority, displayDelay, duration, frequency, maxDisplays, autoHide, showCloseButton, rotationInterval, autoRotate, active } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';

    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).render('error', { 
        user: req.user, 
        currentPage: 'error',
        message: 'Ad not found.' 
      });
    }

    if (!title || !description) {
      return res.status(400).render('ad-form', { 
        user: req.user, 
        ad, 
        isEditing: true, 
        currentPage: 'admin',
        error: 'Title and description are required.' 
      });
    }

    await Ad.findByIdAndUpdate(req.params.id, {
      title,
      description,
      image: image || ad.image,
      link,
      displayType: displayType || ad.displayType,
      priority: parseInt(priority) || ad.priority || 0,
      displayDelay: parseInt(displayDelay) || ad.displayDelay || (displayType === 'popup' ? 5 : 0),
      duration: parseInt(duration) || ad.duration || (displayType === 'popup' ? 10 : 0),
      frequency: frequency || ad.frequency || (displayType === 'popup' ? 'once-per-session' : 'every-visit'),
      maxDisplays: parseInt(maxDisplays) || ad.maxDisplays || (displayType === 'popup' ? 3 : 1),
      autoHide: autoHide === 'on',
      showCloseButton: showCloseButton === 'on',
      rotationInterval: parseInt(rotationInterval) || ad.rotationInterval || (displayType === 'carousel' ? 5 : 0),
      autoRotate: autoRotate === 'on',
      active: active === 'on'
    });

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating ad:', error);
    const ad = await Ad.findById(req.params.id);
    res.status(500).render('ad-form', { 
      user: req.user, 
      ad, 
      isEditing: true, 
      currentPage: 'admin',
      error: 'Failed to update ad. Please try again.' 
    });
  }
});

app.post('/admin/ad/:id/delete', ensureAdmin, async (req, res) => {
  const ad = await Ad.delete(req.params.id);
  if (ad) {
    res.redirect('/admin');
  } else {
    res.status(404).send('Ad not found');
  }
});

// User management routes
app.get('/admin/users', ensureAdmin, async (req, res) => {
  const users = await User.findAll();
  res.render('users', { user: req.user, users, currentPage: 'admin' });
});

app.post('/admin/users/:id/verify', ensureAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { verified: true });
  if (user) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/admin/users/:id/unverify', ensureAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { verified: false });
  if (user) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/admin/users/:id/block', ensureAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: true });
  if (user) {
    // Hide all products from blocked user
    await Product.find({ seller: req.params.id }).then(products => {
      products.forEach(async (product) => {
        await Product.findByIdAndUpdate(product._id, { hidden: true });
      });
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/admin/users/:id/unblock', ensureAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { blocked: false });
  if (user) {
    // Show all products from unblocked user
    await Product.find({ seller: req.params.id }).then(products => {
      products.forEach(async (product) => {
        await Product.findByIdAndUpdate(product._id, { hidden: false });
      });
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Delete user route
app.post('/admin/users/:id/delete', ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow deleting admin accounts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }

    // Delete all products by this user
    await Product.find({ seller: userId }).then(products => {
      products.forEach(async (product) => {
        await Product.findByIdAndDelete(product._id);
      });
    });

    // Delete all reports involving this user
    await Report.find({ $or: [{ reporterId: userId }, { reportedUserId: userId }] }).then(reports => {
      reports.forEach(async (report) => {
        await Report.findByIdAndDelete(report._id);
      });
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin reports routes
app.get('/admin/reports', ensureAdmin, async (req, res) => {
  const reports = await Report.findAll();
  res.render('reports', { user: req.user, reports, currentPage: 'reports' });
});

app.put('/admin/reports/:id/status', ensureAdmin, async (req, res) => {
  const { status } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { status });
  if (report) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

app.delete('/admin/reports/:id', ensureAdmin, async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (report) {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Seller Application Management Routes
app.get('/admin/applications', ensureAdmin, async (req, res) => {
  try {
    const SellerApplication = require('./models/SellerApplication');
    const applications = await SellerApplication.find();

    // Get user data for each application and flatten the structure
    const applicationsWithUsers = await Promise.all(applications.map(async (app) => {
      const user = await User.findById(app.userId);
      return {
        _id: app._id,
        userId: app.userId,
        name: app.personalInfo?.fullName || user?.name || 'Unknown',
        email: app.personalInfo?.email || user?.email || 'Unknown',
        whatsapp: app.personalInfo?.phone || user?.whatsapp || 'Unknown',
        university: app.university,
        shopName: app.businessInfo?.shopName || 'Not specified',
        businessDescription: app.businessInfo?.businessDescription || 'No description provided',
        experience: app.businessInfo?.experience || 'none',
        productCategories: app.businessInfo?.productCategories || 'Not specified',
        status: app.status,
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        reviewedBy: app.reviewedBy,
        reviewNotes: app.reviewNotes,
        user: user ? { name: user.name, email: user.email, whatsapp: user.whatsapp } : null
      };
    }));

    res.render('admin-applications', {
      user: req.user,
      applications: applicationsWithUsers,
      currentPage: 'admin-applications'
    });
  } catch (error) {
    console.error('Error loading applications:', error);
    res.status(500).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Failed to load applications'
    });
  }
});

app.post('/admin/applications/:id/approve', ensureAdmin, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const SellerApplication = require('./models/SellerApplication');

    // Update application status
    await SellerApplication.update(applicationId, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user._id,
      reviewNotes: req.body.notes || ''
    });

    // Update user role and approval status
    const application = await SellerApplication.findById(applicationId);
    if (application) {
      const user = await User.findById(application.userId);
      await User.findByIdAndUpdate(application.userId, {
        role: 'seller',
        sellerApproved: true,
        university: application.university
      });

      // Send approval email
      if (user) {
        await sendSellerApprovalEmail(user, application);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

app.post('/admin/applications/:id/reject', ensureAdmin, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const SellerApplication = require('./models/SellerApplication');

    // Update application status
    await SellerApplication.update(applicationId, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user._id,
      reviewNotes: req.body.notes || ''
    });

    // Send rejection email
    const application = await SellerApplication.findById(applicationId);
    if (application) {
      const user = await User.findById(application.userId);
      if (user) {
        await sendSellerRejectionEmail(user, application, req.body.notes);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

app.post('/admin/applications/:id/unapprove', ensureAdmin, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const SellerApplication = require('./models/SellerApplication');

    // Update application status back to pending
    await SellerApplication.update(applicationId, {
      status: 'pending',
      reviewedAt: null,
      reviewedBy: null,
      reviewNotes: req.body.notes || 'Seller unapproved by admin'
    });

    // Update user role back to buyer and remove seller approval
    const application = await SellerApplication.findById(applicationId);
    if (application) {
      await User.findByIdAndUpdate(application.userId, {
        role: 'buyer',
        sellerApproved: false,
        university: null // Remove university association
      });

      // Send unapproval email
      const user = await User.findById(application.userId);
      if (user) {
        await sendSellerUnapprovalEmail(user, application, req.body.notes);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error unapproving seller:', error);
    res.status(500).json({ error: 'Failed to unapprove seller' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log('Logout error:', err);
      return res.redirect('/');
    }
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.log('Session destroy error:', err);
      }
      res.redirect('/');
    });
  });
});

// Seller shop route
app.get('/seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Find the seller
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.render('error', {
        user: req.user,
        currentPage: 'error',
        message: 'Seller not found'
      });
    }

    // Find all products by this seller
    const products = await Product.find({ seller: sellerId });

    res.render('seller-shop', {
      user: req.user,
      seller: seller,
      products: products,
      currentPage: 'seller-shop'
    });
  } catch (err) {
    console.log('Seller shop error:', err);
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'An error occurred while loading the seller shop'
    });
  }
});

// University sellers route
app.get('/university/:name', async (req, res) => {
  try {
    const universityName = req.params.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const SellerApplication = require('./models/SellerApplication');

    // Get approved applications for this university
    const approvedApplications = await SellerApplication.find({
      status: 'approved',
      university: universityName
    });

    // Get seller data for each application
    const sellers = await Promise.all(approvedApplications.map(async (application) => {
      const seller = await User.findById(application.userId);
      if (seller && seller.sellerApproved) {
        // Get seller's products count
        const products = await Product.find({ seller: seller._id });
        return {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          whatsapp: seller.whatsapp,
          profileImage: seller.profileImage,
          university: application.university,
          businessDescription: application.businessDescription,
          experience: application.experience,
          productsCount: products.length,
          joinedDate: new Date(application.appliedAt).toLocaleDateString()
        };
      }
      return null;
    }));

    // Filter out null sellers
    const validSellers = sellers.filter(seller => seller !== null);

    res.render('university-sellers', {
      user: req.user,
      university: {
        name: universityName,
        urlName: req.params.name
      },
      sellers: validSellers,
      currentPage: 'university'
    });
  } catch (error) {
    console.error('Error loading university sellers:', error);
    res.render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'An error occurred while loading university sellers'
    });
  }
});

// Feed Routes
app.get('/feed', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { posts, currentPage, totalPages, hasNext, hasPrev } = await Post.getFeedPosts(page, 10);

    // Get user data for posts
    const postsWithUsers = await Promise.all(posts.map(async (post) => {
      const author = await User.findById(post.authorId);
      return {
        ...post,
        author: author ? { name: author.name, profileImage: author.profileImage } : { name: 'Unknown User' }
      };
    }));

    res.render('feed', {
      user: req.user,
      posts: postsWithUsers,
      currentPage,
      totalPages,
      hasNext,
      hasPrev,
      currentPage: 'feed'
    });
  } catch (error) {
    console.error('Error loading feed:', error);
    res.status(500).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Failed to load feed'
    });
  }
});

// Create Post
app.post('/posts', ensureAuthenticated, upload.array('images', 10), async (req, res) => {
  try {
    const { content } = req.body;
    const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];

    if (!content && images.length === 0) {
      return res.status(400).json({ error: 'Post must have content or images' });
    }

    const post = await Post.create({
      authorId: req.user._id,
      content: content || '',
      images,
      likes: [],
      comments: [],
      shares: 0,
      active: true,
      createdAt: new Date().toISOString()
    });

    res.redirect('/feed');
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).render('error', {
      user: req.user,
      currentPage: 'error',
      message: 'Failed to create post'
    });
  }
});

// Like/Unlike Post
app.post('/posts/:id/like', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes && post.likes.includes(userId);

    if (isLiked) {
      await Post.removeLike(postId, userId);
    } else {
      await Post.addLike(postId, userId);
    }

    const updatedPost = await Post.findById(postId);
    res.json({
      success: true,
      liked: !isLiked,
      likesCount: updatedPost.likes ? updatedPost.likes.length : 0
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Add Comment
app.post('/posts/:id/comments', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const commentData = {
      authorId: req.user._id,
      content: content.trim(),
      authorName: req.user.name
    };

    await Post.addComment(postId, commentData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete Comment
app.delete('/posts/:postId/comments/:commentId', ensureAuthenticated, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    await Post.deleteComment(postId, commentId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Share Post
app.post('/posts/:id/share', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment share count
    const newSharesCount = (post.shares || 0) + 1;
    await Post.update(postId, { shares: newSharesCount });

    res.json({ success: true, sharesCount: newSharesCount });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

// Delete Post
app.delete('/posts/:id', ensureAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only allow author or admin to delete
    if (post.authorId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.update(postId, { active: false });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Create admin accounts before starting server
createAdminAccounts().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    
    // Get network IP for sharing
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`Network access: http://${iface.address}:${PORT}`);
        }
      }
    }
  });
}).catch(err => {
  console.log('Failed to create admin accounts:', err);
  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    
    // Get network IP for sharing
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`Network access: http://${iface.address}:${PORT}`);
        }
      }
    }
  });
});