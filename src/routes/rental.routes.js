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

router.post('/rent', validateBody(rentBookSchema), RentalController.rentBook);
router.post('/return', validateBody(returnBookSchema), RentalController.returnBook);
router.get('/', validateQuery(getRentalsQuerySchema), RentalController.getAllRentals);
router.get('/stats', RentalController.getRentalStats);
router.get('/overdue', validateQuery(getOverdueRentalsSchema), RentalController.getOverdueRentals);
router.get('/renter/:email', validateParams(getRentalsByRenterSchema), RentalController.getRentalsByRenter);
router.get('/:id', validateParams(rentalIdSchema), RentalController.getRentalById);
router.put('/:id/status', validateParams(rentalIdSchema), RentalController.updateRentalStatus);

export default router;