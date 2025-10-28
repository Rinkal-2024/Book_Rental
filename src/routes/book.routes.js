import express from 'express';
import BookController from '../controllers/book.controller.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validateRequest.js';
import {
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
  bookIdSchema
} from '../validations/book.validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with pagination and filtering
 *     tags: [Books]
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
 *         description: Number of books per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, author, or genre
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
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
 *         description: Books retrieved successfully
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
 *                         $ref: '#/components/schemas/Book'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', validateQuery(getBooksQuerySchema), BookController.getAllBooks);

/**
 * @swagger
 * /api/books/available:
 *   get:
 *     summary: Get only available books
 *     tags: [Books]
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
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: Available books retrieved successfully
 */
router.get('/available', BookController.getAvailableBooks);

/**
 * @swagger
 * /api/books/stats:
 *   get:
 *     summary: Get book statistics
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Book statistics retrieved successfully
 */
router.get('/stats', BookController.getBookStats);

/**
 * @swagger
 * /api/books/genre/{genre}:
 *   get:
 *     summary: Get books by genre
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Book genre
 *     responses:
 *       200:
 *         description: Books by genre retrieved successfully
 */
router.get('/genre/:genre', BookController.getBooksByGenre);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *       404:
 *         description: Book not found
 */
router.get('/:id', validateParams(bookIdSchema), BookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBook'
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', validateBody(createBookSchema), BookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBook'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */
router.put('/:id', validateParams(bookIdSchema), validateBody(updateBookSchema), BookController.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete book by ID (soft delete)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', validateParams(bookIdSchema), BookController.deleteBook);

export default router;