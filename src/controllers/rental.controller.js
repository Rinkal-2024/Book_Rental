import Rental from '../models/rental.model.js';
import Book from '../models/book.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
class RentalController {
  static async rentBook(req, res, next) {
    try {
      const { bookId, renterName, renterEmail, renterPhone, dueDate, notes } = req.body;

      const book = await Book.findById(bookId);
      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      if (!book.canBeRented()) {
        throw new ApiError(400, 'Book is not available for rental');
      }

      const existingRental = await Rental.findOne({
        book: bookId,
        renterEmail,
        status: 'active'
      });

      if (existingRental) {
        throw new ApiError(409, 'You already have an active rental for this book');
      }

      const rental = new Rental({
        book: bookId,
        renterName,
        renterEmail,
        renterPhone,
        dueDate: new Date(dueDate),
        notes
      });

      await rental.save();
      await book.rentBook();
      await book.save();

      await rental.populate('book', 'title author genre');

      return res.status(201).json(
        ApiResponse.created(rental, 'Book rented successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req, res, next) {
    try {
      const { rentalId } = req.body;

      const rental = await Rental.findById(rentalId).populate('book');
      if (!rental) {
        throw new ApiError(404, 'Rental not found');
      }

      if (rental.status === 'returned') {
        throw new ApiError(400, 'Book is already returned');
      }

      await rental.returnBook();
      await rental.save();

      await rental.book.returnBook();
      await rental.book.save();

      return res.status(200).json(
        ApiResponse.success(rental, 'Book returned successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getAllRentals(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        renterEmail,
        bookId,
        sortBy = 'rentalDate',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (renterEmail) {
        filter.renterEmail = renterEmail;
      }
      
      if (bookId) {
        filter.book = bookId;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rentals, total] = await Promise.all([
        Rental.find(filter)
          .populate('book', 'title author genre')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Rental.countDocuments(filter)
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
        ApiResponse.paginated(rentals, pagination, 'Rentals retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getRentalById(req, res, next) {
    try {
      const { id } = req.params;

      const rental = await Rental.findById(id).populate('book', 'title author genre');
      
      if (!rental) {
        throw new ApiError(404, 'Rental not found');
      }

      return res.status(200).json(
        ApiResponse.success(rental, 'Rental retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getRentalsByRenter(req, res, next) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const filter = { renterEmail: email };
      
      if (status) {
        filter.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rentals, total] = await Promise.all([
        Rental.find(filter)
          .populate('book', 'title author genre')
          .sort({ rentalDate: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Rental.countDocuments(filter)
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
        ApiResponse.paginated(rentals, pagination, `Rentals for ${email} retrieved successfully`)
      );

    } catch (error) {
      next(error);
    }
  }

  static async getOverdueRentals(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const filter = {
        $or: [
          {
            status: 'active',
            dueDate: { $lt: new Date() }
          },
          {
            status: 'overdue'
          }
        ]
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rentals, total] = await Promise.all([
        Rental.find(filter)
          .populate('book', 'title author genre')
          .sort({ dueDate: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Rental.countDocuments(filter)
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
        ApiResponse.paginated(rentals, pagination, 'Overdue rentals retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async getRentalStats(req, res, next) {
    try {
      const stats = await Rental.aggregate([
        {
          $group: {
            _id: null,
            totalRentals: { $sum: 1 },
            activeRentals: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            returnedRentals: {
              $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
            },
            overdueRentals: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$status', 'active'] },
                          { $lt: ['$dueDate', new Date()] }
                        ]
                      },
                      { $eq: ['$status', 'overdue'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            totalLateFees: { $sum: '$lateFee' }
          }
        }
      ]);

      const monthlyStats = await Rental.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$rentalDate' },
              month: { $month: '$rentalDate' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $limit: 12
        }
      ]);

      const result = {
        overall: stats[0] || {
          totalRentals: 0,
          activeRentals: 0,
          returnedRentals: 0,
          overdueRentals: 0,
          totalLateFees: 0
        },
        monthly: monthlyStats
      };

      return res.status(200).json(
        ApiResponse.success(result, 'Rental statistics retrieved successfully')
      );

    } catch (error) {
      next(error);
    }
  }

  static async updateRentalStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const rental = await Rental.findById(id);
      if (!rental) {
        throw new ApiError(404, 'Rental not found');
      }

      if (rental.status === 'returned' && status !== 'returned') {
        throw new ApiError(400, 'Cannot change status of returned rental');
      }

      rental.status = status;
      if (notes) {
        rental.notes = notes;
      }

      await rental.save();

      return res.status(200).json(
        ApiResponse.success(rental, 'Rental status updated successfully')
      );

    } catch (error) {
      next(error);
    }
  }
}

export default RentalController;
