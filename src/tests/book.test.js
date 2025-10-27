import request from 'supertest';
import app from '../app.js';
import Book from '../models/book.model.js';
import Rental from '../models/rental.model.js';

describe('Book API Tests', () => {
  beforeEach(async () => {
    await Book.deleteMany({});
    await Rental.deleteMany({});
  });

  describe('POST /api/books', () => {
    it('should create a new book with valid data', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
        description: 'A test book'
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(bookData.title);
      expect(response.body.data.author).toBe(bookData.author);
    });

    it('should return 400 for invalid book data', async () => {
      const invalidData = {
        title: '',
        author: 'Test Author',
        genre: 'InvalidGenre',
        totalCopies: -1,
        availableCopies: 10
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate ISBN', async () => {
      const bookData = {
        title: 'Test Book 1',
        author: 'Test Author',
        genre: 'Fiction',
        isbn: '1234567890',
        totalCopies: 5,
        availableCopies: 5
      };

      await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      const response = await request(app)
        .post('/api/books')
        .send({ ...bookData, title: 'Test Book 2' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      const books = [
        {
          title: 'Book 1',
          author: 'Author 1',
          genre: 'Fiction',
          totalCopies: 5,
          availableCopies: 3
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          genre: 'Non-Fiction',
          totalCopies: 3,
          availableCopies: 0
        }
      ];

      for (const book of books) {
        await new Book(book).save();
      }
    });

    it('should get all books with pagination', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });

    it('should filter books by genre', async () => {
      const response = await request(app)
        .get('/api/books?genre=Fiction')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].genre).toBe('Fiction');
    });

    it('should filter books by availability', async () => {
      const response = await request(app)
        .get('/api/books/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
      response.body.data.items.forEach(book => {
        expect(book.availableCopies).toBeGreaterThan(0);
      });
    });

    it('should search books by title', async () => {
      const response = await request(app)
        .get('/api/books?search=Book 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].title).toBe('Book 1');
    });
  });

  describe('GET /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = new Book({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5
      });
      await book.save();
      bookId = book._id;
    });

    it('should get book by ID', async () => {
      const response = await request(app)
        .get(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(bookId.toString());
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = new Book({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5
      });
      await book.save();
      bookId = book._id;
    });

    it('should update book with valid data', async () => {
      const updateData = {
        title: 'Updated Book Title',
        availableCopies: 3
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.availableCopies).toBe(updateData.availableCopies);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/books/${fakeId}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      const book = new Book({
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Fiction',
        totalCopies: 5,
        availableCopies: 5
      });
      await book.save();
      bookId = book._id;
    });

    it('should soft delete book', async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedBook = await Book.findById(bookId);
      expect(deletedBook.isActive).toBe(false);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/books/available', () => {
    beforeEach(async () => {
      const books = [
        {
          title: 'Available Book',
          author: 'Author 1',
          genre: 'Fiction',
          totalCopies: 5,
          availableCopies: 3
        },
        {
          title: 'Unavailable Book',
          author: 'Author 2',
          genre: 'Fiction',
          totalCopies: 2,
          availableCopies: 0
        }
      ];

      for (const book of books) {
        await new Book(book).save();
      }
    });

    it('should return only available books', async () => {
      const response = await request(app)
        .get('/api/books/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].title).toBe('Available Book');
    });
  });

  describe('GET /api/books/stats', () => {
    beforeEach(async () => {
      const books = [
        {
          title: 'Book 1',
          author: 'Author 1',
          genre: 'Fiction',
          totalCopies: 5,
          availableCopies: 3
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          genre: 'Non-Fiction',
          totalCopies: 3,
          availableCopies: 1
        }
      ];

      for (const book of books) {
        await new Book(book).save();
      }
    });

    it('should return book statistics', async () => {
      const response = await request(app)
        .get('/api/books/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overall.totalBooks).toBe(2);
      expect(response.body.data.overall.totalCopies).toBe(8);
      expect(response.body.data.overall.availableCopies).toBe(4);
    });
  });
});
