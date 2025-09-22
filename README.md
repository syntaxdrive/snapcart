# Sellit - University of Ibadan Marketplace

A full-stack marketplace application for University of Ibadan students to buy and sell products with real-time updates and WhatsApp integration.

## Features

- 🔐 **Authentication**: Secure login/registration with UI email validation
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- 🛒 **Product Listings**: Browse and list products by category
- 💬 **WhatsApp Integration**: Direct contact with sellers
- ⚡ **Real-time Updates**: Live product updates using Socket.io
- 👨‍💼 **Admin Dashboard**: Manage products and users
- 📸 **Image Uploads**: Product photos with Multer
- 🎨 **Modern UI**: Beautiful design with Font Awesome icons

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, EJS templates
- **Backend**: Node.js, Express.js
- **Database**: JSON file storage (no database server required)
- **Authentication**: Passport.js, bcrypt
- **Real-time**: Socket.io
- **File Uploads**: Multer

## Quick Start

### Prerequisites

1. **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)

### Installation

1. **Clone or download the project**

   ```bash
   cd sellit
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup MongoDB (Windows)**

   - Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Run the installer and choose "Complete" installation
   - Create data directory: `mkdir C:\data\db`
   - Start MongoDB service: `net start MongoDB`

4. **Start the application**

   ```bash
   npm start
   ```

5. **Open browser**
   - Navigate to: http://localhost:3000

## Usage

### For Students

- **Register**: Create an account with any email address
- **Login**: Access your dashboard
- **Browse Products**: View items by category
- **List Products**: Sell your items with photos
- **Contact Sellers**: Click WhatsApp links to chat

### For Admins

- Access admin dashboard at `/admin`
- Manage all products and users
- View real-time statistics

## Project Structure

```
sellit/
├── models/           # Database models
│   ├── User.js      # User schema
│   └── Product.js   # Product schema
├── views/           # EJS templates
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── products.ejs
│   ├── sell.ejs
│   └── about.ejs
├── public/          # Static files
│   ├── css/
│   ├── js/
│   └── uploads/
├── server.js        # Main application file
├── package.json     # Dependencies
├── setup.bat       # Windows setup script
└── README.md       # This file
```

## API Endpoints

- `GET /` - Homepage
- `GET /login` - Login page
- `POST /login` - Login authentication
- `GET /register` - Registration page
- `POST /register` - User registration
- `GET /dashboard` - User dashboard
- `GET /products` - Product listings
- `GET /sell` - Sell product form
- `POST /sell` - Create product listing
- `GET /about` - About page
- `POST /logout` - Logout

## Development

### Running in Development Mode

```bash
npm run dev  # If you add nodemon to devDependencies
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sellit
SESSION_SECRET=your-secret-key-here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

## Project Structure

```
sellit/
├── models/
│   ├── User.js
│   └── Product.js
├── views/
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── products.ejs
│   ├── sell.ejs
│   └── about.ejs
├── public/
│   └── uploads/ (for product images)
├── server.js
├── package.json
└── README.md
```

## API Routes

- `GET /` - Home page
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /register` - Registration page
- `POST /register` - Create new user
- `GET /dashboard` - User dashboard
- `GET /sell` - Sell product form
- `POST /sell` - Create product listing
- `GET /products` - Browse products
- `DELETE /product/:id` - Delete product
- `GET /logout` - Logout

## Features in Detail

### Authentication

- Email and password authentication
- Password hashing with bcrypt
- Session management

### Product Management

- Image upload support
- Category filtering
- WhatsApp contact integration

### Real-time Features

- Live product updates
- Socket.io integration for notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
