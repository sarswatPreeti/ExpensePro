# ExpensePro 💰

A comprehensive full-stack expense management application built with React and Node.js, featuring Firebase authentication, PostgreSQL database, and modern UI with Tailwind CSS.

## 🌟 Features

### Core Functionality
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Invoice Handling**: Upload and manage expense invoices/receipts
- **Payment Methods**: Support for multiple payment methods (Cash, Cards, Digital wallets)
- **Categories**: Custom expense categories with auto-creation
- **Analytics**: Comprehensive expense analytics and charts
- **User Profiles**: Profile management with avatar uploads

### Authentication & Security
- **Firebase Authentication**: Secure login with Google OAuth
- **JWT Tokens**: Backend authentication with token refresh
- **Protected Routes**: Client-side route protection
- **User Sessions**: Persistent authentication state

### Advanced Features
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live data synchronization
- **File Uploads**: Invoice and profile picture uploads
- **Data Visualization**: Charts and analytics with Chart.js and Recharts
- **PDF Generation**: Generate PDF reports with jsPDF

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Chart.js & Recharts** - Data visualization
- **Axios** - HTTP client for API calls
- **Firebase SDK** - Authentication integration
- **React Hot Toast** - User notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **Sequelize ORM** - Database modeling and migrations
- **Firebase Admin** - Server-side Firebase integration
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **PostgreSQL Cloud** - Database hosting
- **Environment Variables** - Configuration management

## 📁 Project Structure

```
ExpensePro/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Route components
│   │   ├── services/      # Firebase configuration
│   │   └── api/           # API utilities
│   ├── package.json
│   └── tailwind.config.js
└── server/                # Backend Node.js application
    ├── config/            # Database and app configuration
    ├── controllers/       # Route controllers
    ├── middlewares/       # Custom middleware
    ├── migrations/        # Database migrations
    ├── models/            # Sequelize models
    ├── routes/            # API routes
    ├── services/          # External services
    ├── uploads/           # File upload storage
    ├── utils/             # Utility functions
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Firebase project setup

### Environment Variables

#### Client (.env)
```env
REACT_APP_FIREBASEAPP_API_KEY=your_firebase_api_key
REACT_APP_FIREBASEAPP_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASEAPP_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASEAPP_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASEAPP_APP_ID=your_firebase_app_id
REACT_APP_FIREBASEAPP_MEASUREMENT_ID=your_measurement_id
```

#### Server (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
# OR use discrete variables:
DB_HOST=localhost
DB_NAME=expensepro
DB_USER=your_db_user
DB_PASS=your_db_password

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# JWT
JWT_SECRET=your_jwt_secret_key

# Environment
NODE_ENV=production
PORT=4000

# CORS Origins (comma-separated)
CORS_ORIGIN=https://yourdomain.com,https://anotherdomain.com
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sarswatPreeti/ExpensePro.git
   cd ExpensePro
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Database Setup**
   ```bash
   cd server
   # Run database migrations
   npx sequelize-cli db:migrate
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication with Google provider
   - Download service account key and place in `server/config/`
   - Configure environment variables

5. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend client (from client directory)
   npm start
   ```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `firebaseUid` (Unique Firebase identifier)
- `email`
- `name`
- `profilePicture`
- `createdAt`, `updatedAt`

### Categories Table
- `id` (Primary Key)
- `name`
- `userId` (Foreign Key)
- `createdAt`, `updatedAt`

### Expenses Table
- `id` (Primary Key)
- `title`
- `amount`
- `date`
- `description`
- `invoice` (file path)
- `paymentMethod` (Enum)
- `cardLast4`
- `userId` (Foreign Key)
- `categoryId` (Foreign Key)
- `createdAt`, `updatedAt`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/firebase-login` - Firebase authentication
- `POST /api/auth/logout` - User logout

### Expenses
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/analytics` - Get expense analytics

### Categories
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/upload` - Upload profile picture

## 🎨 UI Components

### Core Components
- **AuthGuard** - Route protection
- **DarkModeToggle** - Theme switching
- **LoadingSpinner** - Loading states
- **Sidebar** - Navigation sidebar
- **TopNavbar** - Top navigation bar

### Pages
- **Dashboard** - Main analytics dashboard
- **AddExpense** - Expense creation form
- **AllExpenses** - Expense listing and management
- **Analytics** - Detailed expense analytics
- **Categories** - Category management
- **Profile** - User profile management
- **Invoices** - Invoice management

## 🔒 Security Features

- **Firebase Authentication** with Google OAuth
- **JWT Token-based** API authentication
- **Protected Routes** on both client and server
- **File Upload Validation** for invoices and profiles
- **SQL Injection Protection** via Sequelize ORM
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind CSS
- **Responsive breakpoints** for all screen sizes
- **Touch-friendly** interface elements
- **Progressive Web App** ready structure

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd server
# Set environment variables in hosting platform
# Deploy with npm start command
```

### Database (PostgreSQL Cloud)
- Use managed PostgreSQL service (Neon, Railway, etc.)
- Configure DATABASE_URL environment variable
- Run migrations in production

## 🧪 Testing

```bash
# Run client tests
cd client
npm test

# Run server tests (if configured)
cd server
npm test
```

## 📈 Performance Optimization

- **Code Splitting** with React.lazy()
- **Image Optimization** for uploads
- **Database Indexing** on frequently queried fields
- **Caching** with appropriate HTTP headers
- **Bundle Size Optimization** with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- File upload size limit: 5MB
- PostgreSQL connection pooling in production environments
- CORS configuration for additional domains

## 🔮 Future Enhancements

- [ ] Multi-currency support
- [ ] Expense sharing between users
- [ ] Budget planning and alerts
- [ ] Advanced reporting features
- [ ] Mobile application (React Native)
- [ ] Recurring expenses
- [ ] Export data (CSV, Excel)
- [ ] Advanced analytics with ML insights

## 📞 Support

For support, email saraswat.preeti04@gmail.com or create an issue in the GitHub repository.

---

**ExpensePro** - Take control of your expenses with style! 💰✨