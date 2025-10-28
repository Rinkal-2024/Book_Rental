import express from 'express';
import RentalController from '../controllers/rental.controller.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validateRequest.js';
import {
  rentBookSchema,
  returnBookSchema,
  getRentalsQuerySchema,
  rentalIdSchema,
  getRentalsByRenterSchema,
  getOverdueRentalsSchema
} from '../validations/rental.validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/rentals/rent:
 *   post:
 *     summary: Rent a book
 *     tags: [Rentals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RentBook'
 *     responses:
 *       201:
 *         description: Book rented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Book not available or validation error
 *       404:
 *         description: Book not found
 *       409:
 *         description: User already has an active rental for this book
 */
router.post('/rent', validateBody(rentBookSchema), RentalController.rentBook);

/**
 * @swagger
 * /api/rentals/return:
 *   post:
 *     summary: Return a rented book
 *     tags: [Rentals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReturnBook'
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Book already returned or validation error
 *       404:
 *         description: Rental not found
 */
router.post('/return', validateBody(returnBookSchema), RentalController.returnBook);

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     summary: Get all rentals with pagination and filtering
 *     tags: [Rentals]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of rentals per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by rental status
 *       - in: query
 *         name: renterEmail
 *         schema:
 *           type: string
 *         description: Filter by renter email
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *         description: Filter by book ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rentalDate, dueDate, returnDate, renterName, status]
 *           default: rentalDate
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Rentals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Rental'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', validateQuery(getRentalsQuerySchema), RentalController.getAllRentals);

/**
 * @swagger
 * /api/rentals/stats:
 *   get:
 *     summary: Get rental statistics
 *     tags: [Rentals]
 *     responses:
 *       200:
 *         description: Rental statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     overall:
 *                       type: object
 *                       properties:
 *                         totalRentals:
 *                           type: integer
 *                         activeRentals:
 *                           type: integer
 *                         returnedRentals:
 *                           type: integer
 *                         overdueRentals:
 *                           type: integer
 *                         totalLateFees:
 *                           type: number
 *                     monthly:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                               month:
 *                                 type: integer
 *                           count:
 *                             type: integer
 */
router.get('/stats', RentalController.getRentalStats);

/**
 * @swagger
 * /api/rentals/overdue:
 *   get:
 *     summary: Get overdue rentals
 *     tags: [Rentals]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of rentals per page
 *     responses:
 *       200:
 *         description: Overdue rentals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Rental'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/overdue', validateQuery(getOverdueRentalsSchema), RentalController.getOverdueRentals);

/**
 * @swagger
 * /api/rentals/renter/{email}:
 *   get:
 *     summary: Get rentals by renter email
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Renter email address
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of rentals per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned, overdue]
 *         description: Filter by rental status
 *     responses:
 *       200:
 *         description: Rentals by renter retrieved successfully
 *       400:
 *         description: Invalid email format
 */
router.get('/renter/:email', validateParams(getRentalsByRenterSchema), RentalController.getRentalsByRenter);

/**
 * @swagger
 * /api/rentals/{id}:
 *   get:
 *     summary: Get rental by ID
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental ID
 *     responses:
 *       200:
 *         description: Rental retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       404:
 *         description: Rental not found
 */
router.get('/:id', validateParams(rentalIdSchema), RentalController.getRentalById);

/**
 * @swagger
 * /api/rentals/{id}/status:
 *   put:
 *     summary: Update rental status
 *     tags: [Rentals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, returned, overdue]
 *                 description: New rental status
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional notes about the status change
 *     responses:
 *       200:
 *         description: Rental status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Invalid status or validation error
 *       404:
 *         description: Rental not found
 */
router.put('/:id/status', validateParams(rentalIdSchema), RentalController.updateRentalStatus);

export default router;