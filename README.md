# Book Rental Management REST API

A comprehensive REST API for managing book rentals built with Node.js, Express.js, MongoDB, and Mongoose. This API provides full CRUD operations for books and rental management with advanced features like pagination, filtering, validation, and comprehensive error handling.

## 🚀 Features

### Core Features
- **Book Management**: Full CRUD operations for books
- **Rental Management**: Rent and return books with transaction safety
- **Advanced Search**: Search books by title, author, genre with pagination
- **Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: Swagger/OpenAPI documentation
- **Testing**: Comprehensive test suite with Jest

### Advanced Features
- **Pagination**: Efficient pagination for all list endpoints
- **Filtering**: Filter books by genre, availability, and search terms
- **Statistics**: Book and rental statistics endpoints
- **Overdue Tracking**: Automatic overdue rental detection
- **Rate Limiting**: API rate limiting for security
- **Security**: Helmet.js for security headers, CORS configuration
- **Logging**: Request logging with Morgan
- **Environment Management**: Environment-based configuration

## 📋 API Endpoints

### Books
- `GET /api/books` - Get all books with pagination and filtering
- `GET /api/books/available` - Get available books
- `GET /api/books/stats` - Get book statistics
- `GET /api/books/genre/:genre` - Get books by genre
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book (soft delete)

### Rentals
- `POST /api/rentals/rent` - Rent a book
- `POST /api/rentals/return` - Return a book
- `GET /api/rentals` - Get all rentals with pagination and filtering
- `GET /api/rentals/stats` - Get rental statistics
- `GET /api/rentals/overdue` - Get overdue rentals
- `GET /api/rentals/renter/:email` - Get rentals by renter email
- `GET /api/rentals/:id` - Get rental by ID
- `PUT /api/rentals/:id/status` - Update rental status (admin)

### Utility
- `GET /health` - Health check endpoint
- `GET /` - API information
- `GET /api-docs` - Swagger documentation

## 🛠️ Installation

### Prerequisites
- Node.js (>=16.0.0)
- MongoDB (>=4.4)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-rental-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/book-rental-api
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Database
Tests use a separate test database (`book-rental-api-test`) to avoid conflicts with development data.

## 📚 API Documentation

Once the server is running, visit:
- **Swagger Documentation**: http://localhost:3000/api-docs
- **API Base URL**: http://localhost:3000/api

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/book-rental-api` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Book Schema
```javascript
{
  title: String (required, 2-200 chars),
  author: String (required, 2-100 chars),
  genre: String (required, enum),
  isbn: String (optional, unique),
  publishedYear: Number (optional, 1000-current year),
  totalCopies: Number (required, 1-1000),
  availableCopies: Number (required, 0-totalCopies),
  description: String (optional, max 1000 chars),
  coverImage: String (optional, valid URL),
  isActive: Boolean (default: true)
}
```

### Rental Schema
```javascript
{
  book: ObjectId (required, ref: Book),
  renterName: String (required, 2-100 chars),
  renterEmail: String (required, valid email),
  renterPhone: String (optional),
  rentalDate: Date (default: now),
  dueDate: Date (required, future date),
  returnDate: Date (optional),
  status: String (enum: active, returned, overdue),
  lateFee: Number (default: 0),
  notes: String (optional, max 500 chars)
}
```

## 🏗️ Project Structure

```
src/
├── server.js              # Server entry point
├── app.js                 # Express app configuration
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── book.controller.js # Book operations
│   └── rental.controller.js # Rental operations
├── models/
│   ├── book.model.js      # Book schema
│   └── rental.model.js    # Rental schema
├── routes/
│   ├── book.routes.js     # Book routes
│   └── rental.routes.js   # Rental routes
├── middlewares/
│   ├── errorHandler.js    # Global error handler
│   ├── notFound.js        # 404 handler
│   ├── validateRequest.js # Request validation
│   └── logger.js          # Logging middleware
├── validations/
│   ├── book.validation.js # Book validation schemas
│   └── rental.validation.js # Rental validation schemas
├── utils/
│   ├── ApiError.js        # Custom error class
│   └── ApiResponse.js     # Standardized responses
└── tests/
    ├── setup.js           # Test setup
    ├── book.test.js       # Book tests
    └── rental.test.js     # Rental tests
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses (no stack traces in production)

## 📊 Performance Features

- **Database Indexing**: Optimized database queries
- **Pagination**: Efficient data pagination
- **Connection Pooling**: MongoDB connection optimization
- **Caching**: Response caching where appropriate

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secrets
- [ ] Configure CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Book CRUD operations
  - Rental management
  - Swagger documentation
  - Comprehensive testing
  - Advanced filtering and pagination
