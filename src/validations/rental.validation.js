import Joi from 'joi';
const rentBookSchema = Joi.object({
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid book ID format',
      'any.required': 'Book ID is required'
    }),
  
  renterName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Renter name must be at least 2 characters long',
      'string.max': 'Renter name cannot exceed 100 characters',
      'any.required': 'Renter name is required'
    }),
  
  renterEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Renter email is required'
    }),
  
  renterPhone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Phone number contains invalid characters'
    }),
  
  dueDate: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'Due date must be in the future',
      'any.required': 'Due date is required'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

const returnBookSchema = Joi.object({
  rentalId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid rental ID format',
      'any.required': 'Rental ID is required'
    }),
  
  returnDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Return date must be a valid date'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

const getRentalsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  status: Joi.string()
    .valid('active', 'returned', 'overdue')
    .optional()
    .messages({
      'any.only': 'Invalid status filter'
    }),
  
  renterEmail: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  bookId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid book ID format'
    }),
  
  sortBy: Joi.string()
    .valid('rentalDate', 'dueDate', 'returnDate', 'renterName', 'status')
    .default('rentalDate')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const rentalIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid rental ID format',
      'any.required': 'Rental ID is required'
    })
});

const getRentalsByRenterSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Renter email is required'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  status: Joi.string()
    .valid('active', 'returned', 'overdue')
    .optional()
    .messages({
      'any.only': 'Invalid status filter'
    })
});

const getOverdueRentalsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

export {
  rentBookSchema,
  returnBookSchema,
  getRentalsQuerySchema,
  rentalIdSchema,
  getRentalsByRenterSchema,
  getOverdueRentalsSchema
};
