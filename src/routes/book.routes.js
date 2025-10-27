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

router.get('/', validateQuery(getBooksQuerySchema), BookController.getAllBooks);
router.get('/available', BookController.getAvailableBooks);
router.get('/stats', BookController.getBookStats);
router.get('/genre/:genre', BookController.getBooksByGenre);
router.get('/:id', validateParams(bookIdSchema), BookController.getBookById);
router.post('/', validateBody(createBookSchema), BookController.createBook);
router.put('/:id', validateParams(bookIdSchema), validateBody(updateBookSchema), BookController.updateBook);
router.delete('/:id', validateParams(bookIdSchema), BookController.deleteBook);

export default router;