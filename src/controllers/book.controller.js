import Book from '../models/book.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
class BookController {
  static async getAllBooks(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        genre,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { isActive: true };
      
      if (genre) {
        filter.genre = genre;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { genre: { $regex: search, $options: 'i' } }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [books, total] = await Promise.all([
        Book.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Book.countDocuments(filter)
      ]);

 
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination = {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      };

      return res.status(200).json(
        ApiResponse.paginated(books, pagination, 'Books retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req, res, next) {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      
      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      return res.status(200).json(
        ApiResponse.success(book, 'Book retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async createBook(req, res, next) {
    try {
      const bookData = req.body;

      if (bookData.isbn) {
        const existingBook = await Book.findOne({ isbn: bookData.isbn });
        if (existingBook) {
          throw new ApiError(409, 'Book with this ISBN already exists');
        }
      }

      const book = new Book(bookData);
      await book.save();

      return res.status(201).json(
        ApiResponse.created(book, 'Book created successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.isbn) {
        const existingBook = await Book.findOne({ 
          isbn: updateData.isbn, 
          _id: { $ne: id } 
        });
        if (existingBook) {
          throw new ApiError(409, 'Book with this ISBN already exists');
        }
      }

      // Get the current book to check existing totalCopies if not being updated
      const currentBook = await Book.findById(id);
      if (!currentBook) {
        throw new ApiError(404, 'Book not found');
      }

      // Validate availableCopies against totalCopies
      const totalCopies = updateData.totalCopies !== undefined ? updateData.totalCopies : currentBook.totalCopies;
      if (updateData.availableCopies !== undefined && updateData.availableCopies > totalCopies) {
        throw new ApiError(400, 'Available copies cannot exceed total copies');
      }

      const book = await Book.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: false }
      );

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      return res.status(200).json(
        ApiResponse.success(book, 'Book updated successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      const { id } = req.params;

      const book = await Book.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      return res.status(200).json(
        ApiResponse.success(null, 'Book deleted successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getAvailableBooks(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        genre,
        search,
        sortBy = 'title',
        sortOrder = 'asc'
      } = req.query;

      const filter = { 
        isActive: true, 
        availableCopies: { $gt: 0 } 
      };
      
      if (genre) {
        filter.genre = genre;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [books, total] = await Promise.all([
        Book.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Book.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination = {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      };

      return res.status(200).json(
        ApiResponse.paginated(books, pagination, 'Available books retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getBooksByGenre(req, res, next) {
    try {
      const { genre } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const filter = { 
        isActive: true, 
        genre: genre 
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [books, total] = await Promise.all([
        Book.find(filter)
          .sort({ title: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Book.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination = {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      };

      return res.status(200).json(
        ApiResponse.paginated(books, pagination, `Books in ${genre} genre retrieved successfully`)
      );

    } catch (error) {
      next(error);
    }
  }

  static async getBookStats(req, res, next) {
    try {
      const stats = await Book.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' },
            rentedCopies: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } }
          }
        }
      ]);

      const genreStats = await Book.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: '$genre',
            count: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const result = {
        overall: stats[0] || {
          totalBooks: 0,
          totalCopies: 0,
          availableCopies: 0,
          rentedCopies: 0
        },
        byGenre: genreStats
      };

      return res.status(200).json(
        ApiResponse.success(result, 'Book statistics retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }
}

export default BookController;
